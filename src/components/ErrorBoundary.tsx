'use client';

import { Component, ReactNode } from 'react';
import { View, Heading, Text, Button } from '@adobe/react-spectrum';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View padding="size-200">
          <Heading level={3}>Something went wrong</Heading>
          <Text>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button
            variant="primary"
            marginTop="size-200"
            onPress={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
