import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useMessages = (params?: { account: string }) => {
  const client = useWeb3InboxClient();
  const { messages: messagesTrigger } = useSubscriptionState();
  const [messages, setMessages] = useState<
    NotifyClientTypes.NotifyMessageRecord[]
  >(client?.getMessageHistory(params) ?? []);

  const account = params ? params.account : null;

  useEffect(() => {
    if (!client) return;

    setMessages(client.getMessageHistory(account ? { account } : undefined));
  }, [client, messagesTrigger, account]);

  const deleteMessage = useCallback(
    async (id: number) => {
      if (client) {
        client.deleteNotifyMessage({ id });
      }
    },
    [client]
  );

  return { messages, deleteMessage };
};

export const useManageSubscription = (params?: { account: string }) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    client?.isSubscribedToCurrentDapp(params) ?? false
  );

  const account = params ? params.account : null;

  useEffect(() => {
    if (!client) return;

    setIsSubscribed(
      client.isSubscribedToCurrentDapp(account ? { account } : undefined)
    );
  }, [client, subscriptionsTrigger, account]);

  const subscribe = useCallback(() => {
    if (client) {
      client.subscribeToCurrentDapp(account ? { account } : undefined);
    } else {
      console.error("Trying to subscribe before init");
    }
  }, [client, account]);

  const unsubscribe = useCallback(() => {
    if (client) {
      client.unsubscribeFromCurrentDapp(account ? { account } : undefined);
    } else {
      console.error("Trying to unsubscribe before init");
    }
  }, [client, account]);

  return { subscribe, unsubscribe, isSubscribed };
};

export const useSubscription = ({ account }: { account: string }) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      client?.getSubscription(account) ?? null
    );

  useEffect(() => {
    if (client) {
      setSubscription(client.getSubscription(account));
    }
  }, [subscriptionsTrigger, account, client]);

  return { subscription };
};

export const useSubscriptionScopes = (params?: { account: string }) => {
  const client = useWeb3InboxClient();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    client?.getNotificationTypes(params) ?? {}
  );

  const account = params ? params.account : undefined;

  useEffect(() => {
    if (client) {
      setSubScopes(
        client.getNotificationTypes(account ? { account } : undefined)
      );
    }
  }, [client, account]);

  useEffect(() => {
    if (client) {
      const sub = client.watchScopeMap(setSubScopes);

      return sub();
    }
  }, [client, account]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (client) {
        return client.update({ account, scope });
      } else {
        console.error("Trying to update subscribe before init");
        return Promise.resolve(false);
      }
    },
    [client, account]
  );

  return { scopes: subScopes, updateScopes };
};
