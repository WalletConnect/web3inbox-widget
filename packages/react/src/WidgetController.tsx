import React from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { AppNotifications } from "./components";
import { useAccount, useInitWeb3InboxClient } from "./hooks";
import WidgetConnect from "./views/Connect";
import WidgetSubscribe from "./views/Subscribe";

export interface W3iWidgetProps {}

export const W3iWidget: React.FC<W3iWidgetProps> = (props) => {
  useInitWeb3InboxClient({
    projectId: "547aafa48826c4d76f492efecde4843d",
    domain: window.location.host,
  });

  const { account, setAccount } = useAccount();

  return (
    <div className="W3iWidget" onClick={() => setAccount("A")}>
      {account}B
    </div>
  );
};
