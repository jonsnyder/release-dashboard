'use client';

import { View, Text, Button } from '@adobe/react-spectrum';
import Alert from '@spectrum-icons/workflow/Alert';

interface ErrorAlertProps {
  error: Error | string;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <View
      backgroundColor="negative"
      padding="size-200"
      borderRadius="medium"
      UNSAFE_style={{ position: 'relative' }}
    >
      <View
        UNSAFE_style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Alert color="negative" />
        <Text>
          {errorMessage}
        </Text>
        {onDismiss && (
          <Button
            variant="secondary"
            onPress={onDismiss}
            UNSAFE_style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            Dismiss
          </Button>
        )}
      </View>
    </View>
  );
}
