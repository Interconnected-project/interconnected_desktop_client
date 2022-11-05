import { SlaveP2PConnection } from 'interconnected_node';

const RTCPeerConnection = require('wrtc').RTCPeerConnection;
const RTCSessionDescription = require('wrtc').RTCSessionDescription;
const RTCIceCandidate = require('wrtc').RTCIceCandidate;

export default class DesktopSlaveP2PConnection implements SlaveP2PConnection {
  private peer: RTCPeerConnection;
  private _masterId: string;
  private _masterRole: string;
  private _operationId: string;
  private communicationChannel: any;

  constructor(
    masterId: string,
    masterRole: string,
    operationId: string,
    onIceCandidateHandler: (candidate: any) => void,
    onMessageHandler: (msg: any) => void,
    onDisconnectionHandler: () => void
  ) {
    this._masterId = masterId;
    this._masterRole = masterRole;
    this._operationId = operationId;
    this.peer = new RTCPeerConnection({
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

    this.peer.onicecandidate = async (e: { candidate: any }) => {
      if (e.candidate) {
        if (
          this.peer.localDescription !== undefined &&
          this.peer.remoteDescription !== undefined
        ) {
          onIceCandidateHandler(e.candidate);
        } else {
          const interval = setInterval(() => {
            if (
              this.peer.localDescription !== undefined &&
              this.peer.remoteDescription !== undefined
            ) {
              clearInterval(interval);
              onIceCandidateHandler(e.candidate);
            }
          }, 100);
        }
      }
    };

    this.peer.ondatachannel = (event) => {
      this.communicationChannel = event.channel;
      this.communicationChannel.onmessage = (e: { data: any }) => {
        onMessageHandler(e.data);
      };
    };

    this.peer.onconnectionstatechange = () => {
      if (this.peer.connectionState === 'failed') {
        onDisconnectionHandler();
      }
    };
  }

  get masterId(): string {
    return this._masterId;
  }

  get masterRole(): string {
    return this._masterRole;
  }

  get operationId(): string {
    return this._operationId;
  }

  createAnswer(): Promise<any> {
    return new Promise<any>((complete) => {
      this.peer.createAnswer().then((answer) => complete(answer));
    });
  }

  setLocalDescription(sdp: any): Promise<void> {
    return new Promise<void>((complete) => {
      this.peer.setLocalDescription(sdp).then(() => complete());
    });
  }

  get localDescription(): any {
    return this.peer.localDescription;
  }

  setRemoteDescription(sdp: any): Promise<void> {
    return new Promise<void>((complete) => {
      this.peer
        .setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => complete());
    });
  }

  get remoteDescription(): any {
    return this.remoteDescription;
  }

  addIceCandidate(candidate: any): Promise<void> {
    return new Promise<void>((complete) => {
      if (
        this.peer.localDescription !== undefined &&
        this.peer.remoteDescription !== undefined
      ) {
        this.peer
          .addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => complete());
      } else {
        const interval = setInterval(() => {
          if (
            this.peer.localDescription !== undefined &&
            this.peer.remoteDescription !== undefined
          ) {
            clearInterval(interval);
            this.peer
              .addIceCandidate(new RTCIceCandidate(candidate))
              .then(() => complete());
          }
        }, 100);
      }
    });
  }

  sendMessage(msg: any): void {
    if (
      this.communicationChannel !== undefined &&
      this.communicationChannel.readyState === 'open'
    ) {
      this.communicationChannel.send(msg);
    } else {
      const interval = setInterval(() => {
        if (
          this.communicationChannel !== undefined &&
          this.communicationChannel.readyState === 'open'
        ) {
          this.communicationChannel.send(msg);
          clearInterval(interval);
        }
      }, 100);
    }
  }

  close(): void {
    this.peer.close();
  }
}
