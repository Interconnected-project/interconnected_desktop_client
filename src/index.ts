import { InterconnectedNode } from 'interconnected_node';
import { v4 as uuidv4 } from 'uuid';
import onIncomingConnectionsHandler from './onIncomingConnectionsHandler';

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';
export const MY_ID = uuidv4();
const node = new InterconnectedNode(MY_ID, onIncomingConnectionsHandler);

console.log('My ID: ' + MY_ID);
node.start(BROKER_SERVICE_ADDRESS);
