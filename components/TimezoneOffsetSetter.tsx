'use client'
import { useEffect } from 'react'

export default function TimezoneOffsetSetter(): null {
  useEffect(() => {
    const offset = new Date().getTimezoneOffset(); // in minutes
    document.cookie = `tzOffset=${offset}; path=/; SameSite=Strict; Secure`
  }, []);

  return null;
}
