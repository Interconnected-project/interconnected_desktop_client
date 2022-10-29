import AnswererP2PConnection from 'interconnected_node/dist/AnswererP2PConnection';
const RTCPeerConnection = require('wrtc').RTCPeerConnection;
const RTCSessionDescription = require('wrtc').RTCSessionDescription;
const RTCIceCandidate = require('wrtc').RTCIceCandidate;

export default async function onIncomingConnectionsHandler(
  payload: any,
  emitIceCandidateCallback: (payload: any) => void,
  disconnectionCallback: () => void
): Promise<AnswererP2PConnection> {
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

  const p2pConnection = new DesktopAnswererP2PConnection(
    peer,
    payload.answererId,
    payload.initiatorId,
    payload.initiatorRole,
    emitIceCandidateCallback
  );

  return new Promise<AnswererP2PConnection>((complete) => {
    complete(p2pConnection);
  });
}

class DesktopAnswererP2PConnection implements AnswererP2PConnection {
  private _peer: RTCPeerConnection;
  private _myId: string;
  private _initiatorId: string;
  private _initiatorRole: string;
  private _emitIceCandidate: (payload: any) => void;

  constructor(
    peer: RTCPeerConnection,
    myId: string,
    initiatorId: string,
    initiatorRole: string,
    emitIceCandidate: (payload: any) => void
  ) {
    this._peer = peer;
    this._myId = myId;
    this._initiatorId = initiatorId;
    this._initiatorRole = initiatorRole;
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
          fromId: this._myId,
          senderRole: 'NODE',
          toId: this._initiatorId,
          receiverRole: this._initiatorRole,
          candidate: e.candidate,
        };
        this._emitIceCandidate(icePayload);
      }
    };
  }

  get myId(): string {
    return this._myId;
  }

  get initiatorId(): string {
    return this._initiatorId;
  }

  get initiatorRole(): string {
    return this._initiatorRole;
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
