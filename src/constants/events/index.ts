/**
 * Central Event Registry
 * All events are stored in config files (offline-first)
 * Only user claim status syncs to Supabase
 */

import { counterEvents } from './counterEvents.config';
import { teraRaidEvents } from './teraRaids.config';
import { mysteryGiftEvents } from './mysteryGifts.config';
import { promoCodeEvents } from './promoCodes.config';
import {
  AnyEvent,
  EventType,
  CounterEvent,
  TeraRaidEvent,
  MysteryGiftEvent,
  PromoCodeEvent,
  isCounterEvent,
  isTeraRaidEvent,
  isMysteryGiftEvent,
  isPromoCodeEvent,
} from './types';

/**
 * Unified registry of all events
 */
export const allEvents: Record<string, AnyEvent> = {
  ...counterEvents,
  ...teraRaidEvents,
  ...mysteryGiftEvents,
  ...promoCodeEvents,
};

/**
 * Get all events as an array
 */
export function getAllEventsArray(): AnyEvent[] {
  return Object.values(allEvents);
}

/**
 * Get events by type
 */
export function getEventsByType(type: EventType): AnyEvent[] {
  return Object.values(allEvents).filter(event => event.eventType === type);
}

/**
 * Get counter events
 */
export function getCounterEvents(): CounterEvent[] {
  return Object.values(allEvents).filter(isCounterEvent);
}

/**
 * Get tera raid events
 */
export function getTeraRaidEvents(): TeraRaidEvent[] {
  return Object.values(allEvents).filter(isTeraRaidEvent);
}

/**
 * Get mystery gift events
 */
export function getMysteryGiftEvents(): MysteryGiftEvent[] {
  return Object.values(allEvents).filter(isMysteryGiftEvent);
}

/**
 * Get promo code events
 */
export function getPromoCodeEvents(): PromoCodeEvent[] {
  return Object.values(allEvents).filter(isPromoCodeEvent);
}

/**
 * Get the soonest expiration date for an event (for sorting)
 * Returns the earliest date that matters for the event
 */
export function getEventSortDate(event: AnyEvent): Date {
  switch (event.eventType) {
    case EventType.COUNTER:
      // For counter events, use distribution end date (last relevant date)
      return new Date(event.distributionEnd);
    
    case EventType.TERA_RAID:
      // For tera raids, use the end of period 2 (or period 1 if no period 2)
      return new Date(event.periods.period2?.end || event.periods.period1.end);
    
    case EventType.MYSTERY_GIFT:
      // For mystery gifts, use end date (or far future if ongoing)
      return event.isOngoing ? new Date('2099-12-31') : new Date(event.endDate);
    
    case EventType.PROMO_CODE:
      // For promo codes, use expiration date
      return new Date(event.expirationDate);
  }
  
  // Fallback (shouldn't reach here with proper types)
  return new Date();
}

/**
 * Check if an event is archived (all dates have passed)
 */
export function isEventArchived(event: AnyEvent): boolean {
  const now = new Date();
  
  switch (event.eventType) {
    case EventType.COUNTER:
      // Counter events are archived after distribution period ends
      return now > new Date(event.distributionEnd);
    
    case EventType.TERA_RAID:
      // Tera raids are archived after both periods end
      const period2End = event.periods.period2?.end || event.periods.period1.end;
      return now > new Date(period2End);
    
    case EventType.MYSTERY_GIFT:
      // Mystery gifts are never archived if ongoing
      if (event.isOngoing) return false;
      return now > new Date(event.endDate);
    
    case EventType.PROMO_CODE:
      // Promo codes are archived after expiration
      return now > new Date(event.expirationDate);
  }
  
  // Fallback (shouldn't reach here with proper types)
  return false;
}

/**
 * Get active events (optionally filtered by type)
 */
export function getActiveEvents(type?: EventType): AnyEvent[] {
  const events = type ? getEventsByType(type) : getAllEventsArray();
  return events
    .filter(event => !isEventArchived(event))
    .sort((a, b) => getEventSortDate(a).getTime() - getEventSortDate(b).getTime());
}

/**
 * Get archived events (optionally filtered by type)
 */
export function getArchivedEvents(type?: EventType): AnyEvent[] {
  const events = type ? getEventsByType(type) : getAllEventsArray();
  return events
    .filter(event => isEventArchived(event))
    .sort((a, b) => getEventSortDate(b).getTime() - getEventSortDate(a).getTime()); // Newest first
}

/**
 * Get a single event by key
 */
export function getEventByKey(eventKey: string): AnyEvent | undefined {
  return allEvents[eventKey];
}

// Re-export everything for convenience
export * from './types';
export { counterEvents, teraRaidEvents, mysteryGiftEvents, promoCodeEvents };

// Backward compatibility - keep old eventConfig import working
export { counterEvents as eventConfig };
export type { CounterEvent as EventConfig };

// Old type still works
export type EventConfigKey = keyof typeof counterEvents;
