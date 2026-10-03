import React, { useEffect } from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/eco')({
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
  component: EcoPageRedirect,
});

function EcoPageRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: '/' });
  }, [navigate]);

  return null;
}

export default EcoPageRedirect;
