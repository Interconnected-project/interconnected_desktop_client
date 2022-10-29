import { InterconnectedNodeBuilder } from 'interconnected_node';
import onIncomingConnectionsHandler from './onIncomingConnectionsHandler';

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';
const MY_ID = 'TODO GENERATE AN ID';
const node = new InterconnectedNodeBuilder().build();

node.start(
  BROKER_SERVICE_ADDRESS,
  MY_ID,
  (msg: string) => console.log(msg),
  onIncomingConnectionsHandler
);
