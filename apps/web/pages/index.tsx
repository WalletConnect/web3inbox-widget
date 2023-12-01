"use client";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  Button,
  Flex,
  Heading,
  Image,
  Tooltip,
  useColorMode,
  useToast,
} from "@chakra-ui/react";

import {
  useManageSubscription,
  useW3iAccount,
} from "@web3inbox/widget-react";

import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { FaBell, FaBellSlash, FaPause, FaPlay } from "react-icons/fa";
import { BsSendFill } from "react-icons/bs";
import useSendNotification from "../utils/useSendNotification";
import { useInterval } from "usehooks-ts";
import Preferences from "../components/Preferences";
import Messages from "../components/Messages";
import Subscription from "../components/Subscription";
import { sendNotification } from "../utils/fetchNotify";
import Subscribers from "../components/Subscribers";

const Home: NextPage = () => {
  /** Web3Inbox SDK hooks **/
  const {
    setAccount,
    data: w3iAccountData,
    register: registerIdentity,
  } = useW3iAccount();

  const {
    subscribe,
    data: subscriptionData,
    unsubscribe,
  } = useManageSubscription();

  const { address } = useAccount({
    onDisconnect: () => {
      setAccount("");
    },
  });

  const { signMessageAsync } = useSignMessage();
  const wagmiPublicClient = usePublicClient();

  const { colorMode } = useColorMode();
  const toast = useToast();

  const { handleSendNotification, isSending } = useSendNotification();
  const [lastBlock, setLastBlock] = useState<string>();
  const [isBlockNotificationEnabled, setIsBlockNotificationEnabled] =
    useState(true);

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync]
  );

  // We need to set the account as soon as the user is connected
  useEffect(() => {
    if (!Boolean(address)) return;
    setAccount(`eip155:1:${address}`);
  }, [signMessage, address, setAccount]);

  const handleRegistration = useCallback(async () => {
    console.log("Calling handle reg")
    try {
      await registerIdentity(signMessage);
    } catch (registerIdentityError) {
      console.error({ registerIdentityError });
    }
  }, [signMessage, registerIdentity]);

  const handleSubscribe = useCallback(async () => {
    await subscribe();
  }, [subscribe]);

  // handleSendNotification will send a notification to the current user and includes error handling.
  // If you don't want to use this hook and want more flexibility, you can use sendNotification.
  const handleTestNotification = useCallback(async () => {
    if (subscriptionData?.isSubscribed) {
      console.log("sending")
      handleSendNotification({
        title: "GM Hacker",
        body: "Hack it until you make it!",
        icon: `${window.location.origin}/WalletConnect-blue.svg`,
        url: window.location.origin,
	// ID retrieved from explorer api - Copy your notification type from WalletConnect Cloud and replace the default value below
        type: "ba0e9ab1-e194-4780-8fc5-3c8abd9678e2",
      });
    }
  }, [handleSendNotification, subscriptionData]);

  // Example of how to send a notification based on some "automation".
  // sendNotification will make a fetch request to /api/notify
  const handleBlockNotification = useCallback(async () => {
    if (subscriptionData?.isSubscribed && isBlockNotificationEnabled) {
      const blockNumber = await wagmiPublicClient.getBlockNumber();
      if (lastBlock !== blockNumber.toString()) {
        setLastBlock(blockNumber.toString());
        try {
          toast({
            title: "New block",
            position: "top",
            variant: "subtle",
          });
          await sendNotification({
            accounts: [`eip155:1:${address}`], // accounts that we want to send the notification to.
            notification: {
              title: "New block",
              body: blockNumber.toString(),
              icon: `${window.location.origin}/eth-glyph-colored.png`,
              url: `https://etherscan.io/block/${blockNumber.toString()}`,
              type: "ba0e9ab1-e194-4780-8fc5-3c8abd9678e2",
            },
          });
        } catch (error: any) {
          toast({
            title: "Failed to send new block notification",
            description: error.message ?? "Something went wrong",
          });
        }
      }
    }
  }, [
    wagmiPublicClient,
    lastBlock,
    subscriptionData,
    toast,
    isBlockNotificationEnabled,
  ]);

  useInterval(() => {
    handleBlockNotification();
  }, 12000);

  return (
    <Flex w="full" flexDirection={"column"} maxW="700px">
      <Image
        aria-label="WalletConnect"
        src={
          colorMode === "dark"
            ? "/WalletConnect-white.svg"
            : "/WalletConnect-black.svg"
        }
      />
      <Heading alignSelf={"center"} textAlign={"center"} mb={6}>
        Web3Inbox hooks - test environment
      </Heading>

      <Flex flexDirection="column" gap={4}>
        {subscriptionData?.isSubscribed ? (
          <Flex flexDirection={"column"} alignItems="center" gap={4}>
            <Button
              leftIcon={<BsSendFill />}
              variant="outline"
              onClick={handleTestNotification}
              colorScheme="purple"
              rounded="full"
              isLoading={isSending}
              loadingText="Sending..."
            >
              Send test notification
            </Button>
            <Button
              leftIcon={isBlockNotificationEnabled ? <FaPause /> : <FaPlay />}
              variant="outline"
              onClick={() =>
                setIsBlockNotificationEnabled((isEnabled) => !isEnabled)
              }
              colorScheme={isBlockNotificationEnabled ? "orange" : "blue"}
              rounded="full"
            >
              {isBlockNotificationEnabled ? "Pause" : "Resume"} block
              notifications
            </Button>
            <Button
              leftIcon={<FaBellSlash />}
              onClick={unsubscribe}
              variant="outline"
              isDisabled={!address}
              colorScheme="red"
              isLoading={subscriptionData.isUnsubscribing}
              loadingText="Unsubscribing..."
              rounded="full"
            >
              Unsubscribe
            </Button>
          </Flex>
        ) : w3iAccountData?.isRegistered ? (
          <Tooltip
            label={
              !Boolean(address)
                ? "Connect your wallet first."
                : "Register your account."
            }
            hidden={Boolean(address)}
          >
            <Button
              leftIcon={<FaBell />}
              onClick={handleSubscribe}
              colorScheme="cyan"
              rounded="full"
              variant="outline"
              w="fit-content"
              alignSelf="center"
              isLoading={subscriptionData?.isSubscribing}
              loadingText="Subscribing..."
              isDisabled={!Boolean(address)}
            >
              Subscribe
            </Button>
          </Tooltip>
        ) : (
          <Tooltip
            label={
              !Boolean(address)
                ? "Connect your wallet first."
                : "Register your account."
            }
            hidden={Boolean(address)}
          >
            <Button
              leftIcon={<FaBell />}
              onClick={handleRegistration}
              colorScheme="cyan"
              rounded="full"
              variant="outline"
              w="fit-content"
              alignSelf="center"
              isLoading={w3iAccountData?.isRegistering}
              loadingText="Registering..."
            >
              Register
            </Button>
          </Tooltip>
	)}

        {subscriptionData?.isSubscribed && (
          <Accordion defaultIndex={[1]} allowToggle mt={10} rounded="xl">
            <Subscription />
            <Messages />
            <Preferences />
            <Subscribers />
          </Accordion>
        )}
      </Flex>
    </Flex>
  );
};

export default Home;
