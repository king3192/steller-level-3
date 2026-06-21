import { useState, useEffect, useRef, useCallback } from 'react';
import { xdr, scValToNative } from '@stellar/stellar-sdk';
import { rpcServer, rentContract } from '../utils/contract';
import { server as horizonServer } from '../utils/stellar';
import { CONTRACT_ID } from '../constants/network';

/**
 * Custom React hook to subscribe/poll events from the deployed Soroban contract.
 * Pools every 8 seconds. Includes mock events fallback for Demo Mode.
 * 
 * @param {boolean} isMock Whether in mock mode.
 * @returns {Array} List of parsed rent payment events.
 */
export function useContractEvents(isMock = false) {
  const [events, setEvents] = useState([]);
  const intervalRef = useRef(null);
  const startLedgerRef = useRef(null);

  // Generate mock events for demo mode
  const getMockEvents = useCallback(() => {
    return [
      {
        id: 'mock-1',
        ledger: 12345,
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        topic: 'pay_rent',
        payer: 'GA7R2U6L26QG3NDXQ4Q6XCY36PZXZVUNH2QLJ34KYY3LMXJ2P3JNZQLS',
        amount: 250,
        total: 250,
        txHash: 'a1b2c3d4e5f6g7h8i9j0mock1',
      },
      {
        id: 'mock-2',
        ledger: 12350,
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
        topic: 'pay_rent',
        payer: 'GCNQW65B5Y3F5547U243XGNYLMX26PA63OEXQ243XJY426PA63OEXQ63',
        amount: 400,
        total: 650,
        txHash: 'a1b2c3d4e5f6g7h8i9j0mock2',
      }
    ];
  }, []);

  const fetchEvents = useCallback(async () => {
    if (isMock) {
      setEvents((prev) => {
        if (prev.length === 0) return getMockEvents();
        return prev;
      });
      return;
    }

    try {
      // 1. Establish startLedger if not set yet (look back ~3000 ledgers, approx. 4 hours)
      if (!startLedgerRef.current) {
        try {
          const ledgerInfo = await horizonServer.ledgers().limit(1).order('desc').call();
          if (ledgerInfo && ledgerInfo.records && ledgerInfo.records.length > 0) {
            const latest = ledgerInfo.records[0].sequence;
            startLedgerRef.current = Math.max(1, latest - 3000);
          } else {
            startLedgerRef.current = 1;
          }
        } catch (err) {
          console.error('Failed to get current ledger for event start offset, defaulting to 1:', err);
          startLedgerRef.current = 1;
        }
      }

      // 2. Fetch events from Soroban RPC
      const response = await rpcServer.getEvents({
        startLedger: startLedgerRef.current,
        filters: [
          {
            type: 'contract',
            contractIds: [CONTRACT_ID],
          },
        ],
        limit: 20,
      });

      if (response && response.events && response.events.length > 0) {
        const parsed = response.events
          .map((event) => {
            let topic1 = null;
            let topic2 = null;
            let amount = 0;
            let total = 0;

            try {
              // Parse topics (usually base64 encoded strings)
              const decodedTopics = event.topic.map((t) => {
                if (typeof t === 'string') {
                  return scValToNative(xdr.ScVal.fromXDR(t, 'base64'));
                }
                return scValToNative(t);
              });

              topic1 = decodedTopics[0]; // e.g. Symbol "pay_rent"
              topic2 = decodedTopics[1]; // e.g. Address of payer

              // Parse value (usually base64 encoded string)
              let decodedVal;
              if (typeof event.value === 'string') {
                decodedVal = scValToNative(xdr.ScVal.fromXDR(event.value, 'base64'));
              } else if (event.value && event.value.xdr) {
                decodedVal = scValToNative(xdr.ScVal.fromXDR(event.value.xdr, 'base64'));
              } else {
                decodedVal = scValToNative(event.value);
              }

              // Event value is emitted as: (amount, total_collected)
              if (Array.isArray(decodedVal)) {
                amount = Number(decodedVal[0]);
                total = Number(decodedVal[1]);
              } else {
                amount = Number(decodedVal);
              }
            } catch (err) {
              console.error('Error decoding event topic/value:', err);
            }

            return {
              id: event.id,
              ledger: event.ledger,
              timestamp: event.ledgerClosedAt,
              topic: topic1,
              payer: topic2,
              amount: amount,
              total: total,
              txHash: event.txHash,
            };
          })
          .filter((evt) => evt.topic === 'pay_rent'); // filter only pay_rent events

        // Sort descending by ledger timestamp/id and deduplicate
        setEvents((prev) => {
          const combined = [...prev, ...parsed];
          const unique = [];
          const seen = new Set();
          
          for (const ev of combined) {
            if (!seen.has(ev.id)) {
              seen.add(ev.id);
              unique.push(ev);
            }
          }
          
          return unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
      }
    } catch (error) {
      console.error('Error polling contract events:', error);
    }
  }, [isMock, getMockEvents]);

  // Handle polling trigger
  useEffect(() => {
    fetchEvents();
    
    intervalRef.current = setInterval(() => {
      fetchEvents();
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchEvents]);

  // Expose a function to add a mock event manually when making a mock payment
  const addMockEvent = useCallback((payer, amount) => {
    setEvents((prev) => {
      const nextTotal = (prev.length > 0 ? prev[0].total : 0) + Number(amount);
      const newMock = {
        id: `mock-${Date.now()}`,
        ledger: 12360 + prev.length,
        timestamp: new Date().toISOString(),
        topic: 'pay_rent',
        payer,
        amount: Number(amount),
        total: nextTotal,
        txHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      };
      return [newMock, ...prev];
    });
  }, []);

  return {
    events,
    refetch: fetchEvents,
    addMockEvent,
  };
}

export default useContractEvents;
