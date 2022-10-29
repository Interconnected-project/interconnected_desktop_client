import { v4 as uuidv4 } from 'uuid';
import { InterconnectedNodeBuilder } from 'interconnected_node';
import onIncomingConnectionsHandler from './onIncomingConnectionsHandler';

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';
const MY_ID = uuidv4();
const node = new InterconnectedNodeBuilder().build();

console.log('My ID: ' + MY_ID);
node.start(
  BROKER_SERVICE_ADDRESS,
  MY_ID,
  (msg: string) => console.log(msg),
  onIncomingConnectionsHandler
);
