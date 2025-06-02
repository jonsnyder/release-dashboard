'use client';

import { Provider, defaultTheme, Heading, View, Text, Link as SpectrumLink, Flex, Content } from '@adobe/react-spectrum';
import Workflow from '@spectrum-icons/workflow/Workflow';

export default function Home() {
  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View height="100vh" padding="size-1000">
        <Flex
          direction="column"
          gap="size-300"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <Workflow size="XXL" />
          <Heading level={1}>Release Automation</Heading>
          <Content>
            <Text>A tool for automating software releases and deployments.</Text>
          </Content>
          <SpectrumLink>
            <a
              href="https://github.com/your-username/release-automation"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </SpectrumLink>
        </Flex>
      </View>
    </Provider>
  );
}
