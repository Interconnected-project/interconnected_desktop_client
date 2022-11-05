import {
  ClientSpecificP2PConnectionBuilders,
  MasterP2PConnectionBuilder,
  SlaveP2PConnectionBuilder,
} from 'interconnected_node';
import DesktopMasterP2PConenctionBuilder from './master_p2p_connection/DesktopMasterP2PConnectionBuilder';
import DesktopSlaveP2PConnectionBuilder from './slave_p2p_connection/DesktopSlaveP2PConnectionBuilder';

export default class DesktopP2PConnectionBuilders
  implements ClientSpecificP2PConnectionBuilders
{
  createNewMasterP2PConnectionBuilder(): MasterP2PConnectionBuilder {
    return new DesktopMasterP2PConenctionBuilder();
  }
  createNewSlaveP2PConnectionBuilder(): SlaveP2PConnectionBuilder {
    return new DesktopSlaveP2PConnectionBuilder();
  }
}
