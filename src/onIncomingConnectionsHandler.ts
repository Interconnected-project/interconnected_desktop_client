/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
import MasterP2PConnection from 'interconnected_node/dist/interconnected_node/masters_hub/MasterP2PConnection';
import { MY_ID } from './index';
const RTCPeerConnection = require('wrtc').RTCPeerConnection;
const RTCSessionDescription = require('wrtc').RTCSessionDescription;
const RTCIceCandidate = require('wrtc').RTCIceCandidate;

export default async function onIncomingConnectionsHandler(
  payload: any,
  emitIceCandidateCallback: (payload: any) => void,
  disconnectionCallback: () => void
): Promise<MasterP2PConnection> {
  const peer: RTCPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: 'stun:stun.stunprotocol.org',
      },
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com',
      },
    ],
  });

  await peer
    .setRemoteDescription(new RTCSessionDescription(payload.sdp))
    .then(() => {
      return peer.createAnswer();
    })
    .then((answer: any) => {
      return peer.setLocalDescription(answer);
    });

  peer.onconnectionstatechange = () => {
    if (peer.connectionState === 'failed') {
      disconnectionCallback();
    }
  };

  const p2pConnection = new DesktopMasterP2PConnection(
    peer,
    MY_ID,
    payload.operationId,
    payload.masterId,
    payload.masterRole,
    emitIceCandidateCallback
  );

  return new Promise<MasterP2PConnection>((complete) => {
    complete(p2pConnection);
  });
}

class DesktopMasterP2PConnection implements MasterP2PConnection {
  private _peer: RTCPeerConnection;
  private _operationId: string;
  private _masterId: string;
  private _masterRole: string;
  private _emitIceCandidate: (payload: any) => void;

  constructor(
    peer: RTCPeerConnection,
    private myId: string,
    operationId: string,
    masterId: string,
    masterRole: string,
    emitIceCandidate: (payload: any) => void
  ) {
    this._peer = peer;
    this._operationId = operationId;
    this._masterId = masterId;
    this._masterRole = masterRole;
    this._emitIceCandidate = emitIceCandidate;

    this._peer.ondatachannel = (event: { channel: any }) => {
      const testChannel = event.channel;
      testChannel.onmessage = (e: { data: string }) => {
        let value = parseInt(e.data);
        console.log('received ' + value++);
        if (
          this._peer.connectionState.toString() !== 'disconnected' &&
          this._peer.connectionState.toString() !== 'failed' &&
          this._peer.connectionState.toString() !== 'closed'
        )
          testChannel.send(value.toString());
      };
    };

    this._peer.onicecandidate = (e: { candidate: any }) => {
      if (e.candidate) {
        const icePayload = {
          fromId: this.myId,
          fromRole: 'NODE',
          toId: this._masterId,
          toRole: this._masterRole,
          candidate: e.candidate,
        };
        this._emitIceCandidate(icePayload);
      }
    };
  }

  get operationId(): string {
    return this._operationId;
  }

  get masterId(): string {
    return this._masterId;
  }

  get masterRole(): string {
    return this._masterRole;
  }

  get answer(): any {
    return this._peer.localDescription;
  }

  setIceCandidate(candidate: any): void {
    this._peer
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((e) => console.log(e));
  }

  disconnect(): void {
    this._peer.close();
  }
}
