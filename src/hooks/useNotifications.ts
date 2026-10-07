import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckIn } from '../types';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendAppNotification,
  isNotificationSupported,
  registerPushSubscription
} from '../utils/notificationService';

export function useNotifications(
  checkIns: CheckIn[] = [],
  onEquipmentAccepted?: (checkIn: CheckIn) => void
) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => getNotificationPermission());
  const [settings, setSettings] = useState<NotificationSettings>(() => getNotificationSettings());
  const [supported, setSupported] = useState<boolean>(false);
  
  // Track previous checkIn status mapping to detect changes in real-time
  const prevStatusesRef = useRef<Map<string, string>>(new Map());
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    setSupported(isNotificationSupported());
    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);
    if (currentPerm === 'granted') {
      // Immediate attempt and fallback after Service Worker activation
      registerPushSubscription().catch(() => {});
      const timer = setTimeout(() => {
        registerPushSubscription().catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveNotificationSettings(updated);
      return updated;
    });
  }, []);

  const triggerTestNotification = useCallback(async () => {
    if (permission !== 'granted') {
      const res = await requestPermission();
      if (res !== 'granted') {
        return false;
      }
    }

    return await sendAppNotification({
      title: '¡Notificación de Prueba! 🔔',
      body: 'Tu app móvil PrintFix está configurada para avisarte con sonido y vibración cuando un equipo sea aceptado.',
      tag: 'test-notification'
    });
  }, [permission, requestPermission]);

  // Real-time listener for checkIns status changes (e.g. transitioning to 'Aceptado')
  useEffect(() => {
    if (!checkIns || checkIns.length === 0) return;

    // Skip trigger on very first load of check-ins, just populate the map
    if (isInitialLoadRef.current) {
      checkIns.forEach((c) => {
        prevStatusesRef.current.set(c.id, c.printer?.status || 'Ingresado');
      });
      isInitialLoadRef.current = false;
      return;
    }

    if (!settings.enabled || !settings.notifyOnAccepted) {
      // Still update mapping to avoid stale state if re-enabled later
      checkIns.forEach((c) => {
        prevStatusesRef.current.set(c.id, c.printer?.status || 'Ingresado');
      });
      return;
    }

    checkIns.forEach((c) => {
      const prevStatus = prevStatusesRef.current.get(c.id);
      const currentStatus = c.printer?.status || 'Ingresado';

      // Detect if status just changed to 'Aceptado'
      if (prevStatus && prevStatus !== 'Aceptado' && currentStatus === 'Aceptado') {
        const brandModel = `${c.printer?.brand || ''} ${c.printer?.model || ''}`.trim() || 'Equipo';
        const clientName = c.client?.name || 'Cliente';
        const idShort = c.id ? `(#${c.id.slice(-5)})` : '';

        sendAppNotification({
          title: '¡Equipo Aceptado! 🎉',
          body: `El equipo ${brandModel} ${idShort} de ${clientName} ha sido marcado como ACEPTADO.`,
          tag: `checkin-accepted-${c.id}`,
          data: { checkInId: c.id }
        });

        if (onEquipmentAccepted) {
          onEquipmentAccepted(c);
        }
      }

      // Update map with latest status
      prevStatusesRef.current.set(c.id, currentStatus);
    });
  }, [checkIns, settings, onEquipmentAccepted]);

  return {
    permission,
    settings,
    supported,
    requestPermission,
    updateSettings,
    triggerTestNotification
  };
}
