export class Compression {

  // parses the variable parts of the SDP into a semicolon separated string
  static parseSdp = (d: RTCSessionDescription|null) => {
    if (!d) {
      return "";
    }
    const sdp = d.sdp;
  
    //@ts-ignore
    const sparta = sdp.match(" (.+) IN IP4")[1]; //@ts-ignore
    const ip = sdp.match(" .+ IN IP4 (.+)")[1]; //@ts-ignore
    const ufrag = sdp.match("a=ice-ufrag:(.+)")[1]; //@ts-ignore
    const pwd = sdp.match("a=ice-pwd:(.+)")[1]; //@ts-ignore
    const sha = sdp.match("a=fingerprint:sha-256 (.+)")[1]; //@ts-ignore
    const setup = sdp.match("a=setup:(.+)")[1]; //@ts-ignore
    const maxMessageSize = sdp.match("a=max-message-size:(\\d+)")[1]; //@ts-ignore
    const ip2 = sdp.match("c=IN IP4 ([\\d\\.]+)")[1]; //@ts-ignore
  
    var matches = [sparta, ip, ufrag, pwd, sha, setup, maxMessageSize, ip2];
  
    const candidates = sdp.match(/a=candidate.+\r\n/g);
    if (candidates) {
      candidates.forEach((c) => {
        const m = c.match("a=candidate:(.+)\r\n");
        if (m) {
          matches.push(m[1]);
        }
      });
    }
  
    return matches.join(";");
  }
  
  // constructs an SDP from a semicolon separated string
  static constructSdp = (sdpList: string) => {
    const vars = sdpList.split(";");
    var sdpStrings = [
      "v=0",
      `o=mozilla...THIS_IS_SDPARTA-99.0 ${vars[0]} IN IP4 ${vars[1]}`,
      "s=-",
      "t=0 0",
      `a=fingerprint:sha-256 ${vars[4]}`,
      "a=group:BUNDLE 0",
      "a=ice-options:trickle",
      "a=msid-semantic:WMS *",
      "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
      `c=IN IP4 ${vars[7]}`,
      "a=sendrecv",
      `a=ice-pwd:${vars[3]}`,
      `a=ice-ufrag:${vars[2]}`,
      "a=mid:0",
      `a=setup:${vars[5]}`,
      "a=sctp-port:5000",
      `a=max-message-size:${vars[6]}`
    ]
    for (var i = 8; i < vars.length; i++) {
      sdpStrings.push(`a=candidate:${vars[i]}`);
    }
    sdpStrings.push("a=end-of-candidates");
    sdpStrings.push("");
    return sdpStrings.join("\r\n");
  }
}
