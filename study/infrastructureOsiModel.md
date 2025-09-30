---
title: OSI Model
permalink: /study/infrastructureOsiModel
---

# OSI Model

The OSI (Open Systems Interconnection) Model is a conceptual framework that explains how data moves from one device to another across a network. It breaks communication into seven layers, each with a specific role—from turning raw electrical signals into bits, all the way up to human-readable applications like web browsers or email. By separating these responsibilities, the OSI model makes it easier to design, troubleshoot, and scale networks. It supports everything from simple device-to-device communication (like two computers in a LAN) to complex many-to-many interactions across the global internet. Each higher OSI layer builds on the services of the layer below, while layers remain functionally independent when viewed side-by-side.

<table class="study-table">
<thead>
<tr>
<th>OSI Layer</th>
<th>Example Protocols</th>
<th>Data Unit</th>
<th>What It Adds / Handles</th>
<th>Key Details & Examples</th>
</tr>
</thead>
<tbody>
<tr>
<td>L7 Application</td>
<td>HTTP, DNS, SMTP, FTP</td>
<td>Data</td>
<td>User-facing services & protocols</td>
<td>Apps talk in human-readable formats. Browser → HTTP Request, Mail client → SMTP.</td>
</tr>
<tr>
<td>L6 Presentation</td>
<td>TLS/SSL, JPEG, JSON</td>
<td>Record</td>
<td>Data format, encryption, compression</td>
<td>TLS encrypts HTTP; JSON/XML standardize data; JPEG/MP3 compress media. Often merged into L7 in practice.</td>
</tr>
<tr>
<td>L5 Session</td>
<td>NetBIOS, RPC</td>
<td>–</td>
<td>Session control (setup, sync, teardown)</td>
<td>Rarely explicit today. Example: RPC, NetBIOS. TLS sessions can resume without full handshake.</td>
</tr>
<tr>
<td>L4 Transport</td>
<td>TCP, UDP</td>
<td>Segment</td>
<td>Reliable delivery (TCP) or fast fire-and-forget (UDP)</td>
<td>Fixes L3 issues: out-of-order, loss, no channels. TCP headers include ports, seq/ack, window, checksum. TCP 3-way handshake → SYN, SYN/ACK, ACK. Maintains state (reliable, ordered). UDP = stateless (no session info).</td>
</tr>
<tr>
<td>L3 Network</td>
<td>IP, ICMP</td>
<td>Packet</td>
<td>Logical addressing, routing between networks</td>
<td>IP = addressing system. ICMP = control (ping, errors). Routers strip/replace frames at every hop. Uses ARP to resolve IP→MAC. Routing tables decide next hop (default 0.0.0.0/0). House = IP, Apartment = Port.</td>
</tr>
<tr>
<td>L2 Data Link</td>
<td>Ethernet, Wi-Fi, PPP</td>
<td>Frame</td>
<td>Local delivery between devices on the same medium</td>
<td>MAC addresses unique per device. Frame = Header (src/dst MAC + EtherType) + Payload (L3 packet) + CRC. Handles collisions (CSMA/CD). Supports unicast, broadcast, VLAN tagging. Protocols: Ethernet, Wi-Fi, MPLS, PPP.</td>
</tr>
<tr>
<td>L1 Physical</td>
<td>Copper, Fiber, Wi-Fi PHY</td>
<td>Bits</td>
<td>Transmission of raw signals</td>
<td>Defines voltage, RF, or light wavelength. No addressing or error detection. Standards: copper (RJ45), fiber optics, Wi-Fi PHY.</td>
</tr>
</tbody>
</table>


🔁 **Encapsulation order**:
**Frame → Packet → Segment → Application Data**
…and the whole frame turns into **bits/signals** at Layer 1.

A really good diagram illustration is from [Osi Model Explained - Byte Byte Go](https://bytebytego.com/guides/what-is-osi-model/)

<div style="text-align: center; margin: 20px 0;">
<img src="https://assets.bytebytego.com/diagrams/0295-osi-model.jpeg" alt="ByteByteGo OSI Model" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</div>


---

## Devices at Different Layers

Different network devices operate at different OSI layers, each handling only the information relevant to its role:

<table class="study-table">
<thead>
<tr>
<th>Device</th>
<th>OSI Layer</th>
<th>What It Does</th>
<th>Protocol Examples</th>
<th>Authentication</th>
</tr>
</thead>
<tbody>
<tr>
<td>Hub</td>
<td>L1 (Physical)</td>
<td>Blindly repeats bits to all ports. No concept of frames or addresses → collisions possible.</td>
<td>None (raw electrical/optical signals)</td>
<td>None</td>
</tr>
<tr>
<td>Switch</td>
<td>L2 (Data Link)</td>
<td>Forwards Ethernet frames using MAC address table. Falls back to broadcast (flooding) if unknown.</td>
<td>Ethernet, ARP, VLAN (802.1Q), STP</td>
<td>Port security (MAC binding), 802.1X (RADIUS/EAP)</td>
</tr>
<tr>
<td>Router</td>
<td>L3 (Network)</td>
<td>Routes IP packets across networks. Strips L2 header and adds a new one for each hop.</td>
<td>IP, ICMP, OSPF, BGP, EIGRP</td>
<td>BGP MD5, OSPF auth (MD5/SHA), IPsec for secure tunnels</td>
</tr>
<tr>
<td>Firewall</td>
<td>L3–L4 (sometimes L7)</td>
<td>Inspects and filters packets based on IP, ports, and sometimes application signatures.</td>
<td>IP, TCP/UDP, HTTP/S (for deep inspection)</td>
<td>Rule sets, TLS interception (certificates), VPN auth</td>
</tr>
<tr>
<td>Load Balancer</td>
<td>L4–L7</td>
<td>Distributes client requests across multiple servers, can also terminate TLS.</td>
<td>TCP, HTTP/S, TLS, gRPC</td>
<td>TLS certificates, client certs, token-based auth</td>
</tr>
</tbody>
</table>


---

## Layer 2 - ARP

ARP (Address Resolution Protocol) maps an IP address (L3) to a MAC address (L2) so devices can deliver frames on a local network. It works by broadcasting “Who has this IP?” and the target replies with its MAC. Once resolved, the sender builds the frame (Src MAC → Dst MAC) and hands it to Layer 1, which transmits the raw bits as electrical, optical, or radio signals.

```
@startuml
actor "Host A\n(133.33.3.7)" as A
participant "Switch / LAN" as LAN
actor "Host B\n(133.33.3.10)" as B

== Step 1: Need to Send ==
A -> A: Wants to send packet to B (IP 133.33.3.10)
note right of A: Needs B's MAC address

== Step 2: ARP Request ==
A -> LAN: Broadcast ARP Request\n"Who has 133.33.3.10? Tell 133.33.3.7"
note over LAN: Sent to FF:FF:FF:FF:FF:FF (all hosts)

== Step 3: ARP Reply ==
B -> LAN: ARP Reply\n"I am 133.33.3.10, my MAC = 3e:22:fb:b9:5b:78"
LAN -> A: Deliver ARP Reply

== Step 4: Frame Delivery ==
A -> B: Frame (Src MAC A → Dst MAC B)\nCarrying IP Packet (A IP → B IP)
note over A,B: Now Host A can send data directly to Host B
@enduml

```

<div style="text-align: center; margin: 20px 0;">
<img src="./assets/l2_arp.png" alt="L2 ARP Example" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</div>

---

## Layer 2 - VLANs, Trunks & QinQ 

VLANs, trunks, and QinQ are needed to segment traffic, reduce broadcast domains, and efficiently carry multiple logical networks over the same physical infrastructure.

* **VLAN (802.1Q):**
  * Adds a VLAN ID tag inside Ethernet frames.
  * Splits one physical switch into **multiple broadcast domains** → improves scalability & security.

* **Trunks:**
  * A single link between switches that **carries multiple VLANs** using tagging.
  * Avoids needing one cable per VLAN.

* **QinQ (802.1AD):**
  * **VLAN stacking** (two tags: S-Tag + C-Tag).
  * Lets ISPs carry customer VLANs over their own backbone.
  * Expands VLAN ID space beyond the 4096 limit.

👉 All three work at **Layer 2 (Frames)** to logically separate traffic over shared physical networks.

---

## Layer 3 - Routing

Layer 3 (Network) routing forwards packets across different networks. At each hop, the router keeps the IP packet unchanged (source IP → destination IP) but removes the old Layer 2 frame and attaches a new one with the next hop’s MAC address. This process lets traffic move from a local LAN to remote networks through multiple routers. Note, L3 Routing depends on L2 ARP.

```
@startuml
actor Host as H
participant "Router 1\n(Home Gateway)" as R1
participant "Router 2\n(Transit)" as R2
actor "Destination Host" as D

== Step 1: Local Network ==
H -> R1: Frame(H-MAC → R1-MAC) carrying Packet(H-IP → D-IP)
note right of H: ARP used to resolve R1 MAC

== Step 2: First Routing Hop ==
R1 -> R2: Frame(R1-MAC → R2-MAC) carrying Packet(H-IP → D-IP)
note over R1: Removes old frame (H-MAC → R1-MAC)\nAdds new frame (R1-MAC → R2-MAC)

== Step 3: Second Routing Hop ==
R2 -> D: Frame(R2-MAC → D-MAC) carrying Packet(H-IP → D-IP)
note over R2: Removes old frame (R1-MAC → R2-MAC)\nAdds new frame (R2-MAC → D-MAC)\nUses ARP to resolve D MAC

== Step 4: Delivery ==
D <-- R2: Destination Host receives Packet(H-IP → D-IP)
note right of D: Frame removed, IP packet delivered up the stack
@enduml

```

<div style="text-align: center; margin: 20px 0;">
<img src="./assets/l3_routing.png" alt="L3 Routing Example" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</div>

---

## Multi Layer 4 & 7 - TLS and IPSec Tunnel

TLS handshake for encrypted communication:

```
@startuml
actor Server
actor Client
actor CA

== Certificate Setup (out of band) ==
Server -> CA: CSR (public key + org info)
CA -> Server: Signed Certificate (X.509)

== TCP 3-Way Handshake (TLS only) ==
Client -> Server: SYN
Server -> Client: SYN-ACK
Client -> Server: ACK
note over Client,Server: TCP connection established

== TLS Handshake ==
Client -> Server: ClientHello (supported ciphers, random)
Server -> Client: ServerHello + Certificate
Client -> CA: Validate Certificate Chain
note over Client: Check CA root, expiry, domain

alt RSA Key Exchange (older)
  Client -> Server: Pre-Master Secret (encrypted with server pubkey)
  note over Client,Server: Derive Master Secret & Session Keys
else (EC)DHE Key Exchange (modern)
  Client -> Server: DH/ECDH public value
  Server -> Client: DH/ECDH public value
  note over Client,Server: Derive Shared Secret (PFS)
end

Client -> Server: Finished
Server -> Client: Finished
note over Client,Server: Secure TLS Channel Established

== Application Data ==
Client -> Server: Encrypted HTTP Request
Server -> Client: Encrypted HTTP Response

== IPsec IKE Phase 1 (Main Mode) ==
Client -> Server: IKE_SA_INIT (DH values, nonces, proposals)
Server -> Client: IKE_SA_INIT Response
note over Client,Server: DH/ECDH → Shared Key (IKE SA)

Client -> Server: IKE_AUTH (ID, Certificate, Auth payload)
Server -> Client: IKE_AUTH Response
note over Client,Server: Peers authenticated, secure control channel

== IPsec IKE Phase 2 (Quick Mode) ==
Client -> Server: Child SA proposal (ESP/AH algorithms, lifetimes)
Server -> Client: Child SA response
note over Client,Server: Derive IPsec SA keys from Phase 1

== Encrypted Tunnel Established ==
Client -> Server: Encrypted IP packets (ESP/AH)
Server -> Client: Encrypted IP packets (ESP/AH)
@enduml


```

<div style="text-align: center; margin: 20px 0;">
<img src="./assets/tls_handshake.png" alt="TLS Handshake" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</div>

---

## Commands by OSI Layer

<table class="study-table">
<thead>
<tr>
<th>Layer</th>
<th>Command</th>
<th>Purpose</th>
<th>Example</th>
<th>Popular Flags</th>
</tr>
</thead>
<tbody>
<tr>
<td>L2 Data Link</td>
<td><code>arp</code></td>
<td>Show/modify ARP cache (IP↔MAC)</td>
<td><code>arp -a</code></td>
<td><code>-a</code> all, <code>-d</code> delete</td>
</tr>
<tr>
<td></td>
<td><code>ip link</code></td>
<td>Manage NICs, errors, drops</td>
<td><code>ip -s link show eth0</code></td>
<td><code>-s</code> stats, <code>set</code> up/down</td>
</tr>
<tr>
<td></td>
<td><code>ethtool</code></td>
<td>NIC driver/speed info</td>
<td><code>ethtool eth0</code></td>
<td><code>-i</code> driver info, <code>-S</code> stats</td>
</tr>
<tr>
<td>L3 Network</td>
<td><code>ping</code></td>
<td>Test reachability + latency (ICMP)</td>
<td><code>ping -c 4 8.8.8.8</code></td>
<td><code>-c</code> count, <code>-s</code> size, <code>-I</code> iface</td>
</tr>
<tr>
<td></td>
<td><code>traceroute</code>/<code>mtr</code></td>
<td>Show hop path</td>
<td><code>mtr -rw 8.8.8.8</code></td>
<td><code>-r</code> report, <code>-n</code> numeric, <code>-w</code> wide</td>
</tr>
<tr>
<td></td>
<td><code>ip route</code></td>
<td>Show/manage routing table</td>
<td><code>ip route show</code></td>
<td>add/del routes</td>
</tr>
<tr>
<td>L4 Transport</td>
<td><code>ss</code>/<code>netstat</code></td>
<td>List sockets, ports, states</td>
<td><code>ss -antp</code></td>
<td><code>-a</code> all, <code>-t</code> TCP, <code>-u</code> UDP, <code>-p</code> proc</td>
</tr>
<tr>
<td></td>
<td><code>tcpdump</code></td>
<td>Capture packets</td>
<td><code>tcpdump -i eth0 port 443 -nnvvXSs 1500</code></td>
<td><code>-i</code> iface, <code>-nn</code> no resolve, <code>-w</code> write</td>
</tr>
<tr>
<td>L7 Application</td>
<td><code>dig</code></td>
<td>DNS resolution</td>
<td><code>dig +trace example.com</code></td>
<td><code>+trace</code>, <code>@server</code></td>
</tr>
<tr>
<td></td>
<td><code>nslookup</code></td>
<td>Legacy DNS tool</td>
<td><code>nslookup example.com 8.8.8.8</code></td>
<td>server param</td>
</tr>
<tr>
<td></td>
<td><code>curl</code></td>
<td>Test HTTP/TLS endpoints</td>
<td><code>curl -vk https://example.com</code></td>
<td><code>-v</code> verbose, <code>-k</code> ignore cert</td>
</tr>
<tr>
<td></td>
<td><code>wget</code></td>
<td>Fetch HTTP/FTP files</td>
<td><code>wget --spider https://example.com</code></td>
<td><code>--spider</code> test only, <code>-O</code> output</td>
</tr>
<tr>
<td>Cross</td>
<td><code>iftop</code></td>
<td>Bandwidth by connection</td>
<td><code>iftop -i eth0</code></td>
<td><code>-n</code> numeric, <code>-P</code> show ports</td>
</tr>
<tr>
<td></td>
<td><code>nmap</code></td>
<td>Scan ports/services</td>
<td><code>nmap -sS -p 1-1000 10.1.2.3</code></td>
<td><code>-sS</code> SYN, <code>-sV</code> version, <code>-A</code> aggressive</td>
</tr>
</tbody>
</table>


---

## IPv4 Classes & Reservations

IPv4 addresses are 32-bit numbers, written as four octets (groups of 8 bits) in decimal, separated by dots (e.g., 192.168.1.1). Early on, these addresses were divided into classes (A–E) to handle different network sizes and special purposes.

* **Class A (0.0.0.0 – 127.255.255.255)**
  * Originally: Very large networks (up to \~16 million hosts).
  * Reserved bits:
    * `0.0.0.0/8` → “this network.”
    * `127.0.0.0/8` → **loopback** (localhost, e.g., `127.0.0.1`).
    * `10.0.0.0/8` → **private addressing** (RFC 1918).

* **Class B (128.0.0.0 – 191.255.255.255)**
  * Originally: Medium networks (up to \~65,000 hosts).
  * Reserved bits:
    * `172.16.0.0 – 172.31.255.255` → **private use**.

* **Class C (192.0.0.0 – 223.255.255.255)**
  * Originally: Small networks (up to 254 hosts).
  * Reserved bits:
    * `192.168.0.0/16` → **private use**.
    * `192.0.2.0/24` → **TEST-NET-1** (docs/examples).
    * `198.51.100.0/24` → **TEST-NET-2**.
    * `203.0.113.0/24` → **TEST-NET-3**.

* **Class D (224.0.0.0 – 239.255.255.255)**
  * **Reserved for multicast.**
  * Examples:
    * `224.0.0.1` → all hosts in subnet.
    * `224.0.0.2` → all routers in subnet.

* **Class E (240.0.0.0 – 255.255.255.255)**
  * **Reserved for experimental use.**
  * Not routable on the public internet.

👉 In practice:
* **Classes A/B/C**: Mostly historical; we now use **CIDR (Classless Inter-Domain Routing)** instead of rigid class boundaries.
* **Class D**: Still active for multicast (e.g., streaming, routing protocols like OSPF).
* **Class E**: Reserved/unused.

### Decimal and Binary Converions

<table class="study-table">
<thead>
<tr>
<th style="text-align: center;">Position</th>
<th style="text-align: center;">1</th>
<th style="text-align: center;">2</th>
<th style="text-align: center;">3</th>
<th style="text-align: center;">4</th>
<th style="text-align: center;">5</th>
<th style="text-align: center;">6</th>
<th style="text-align: center;">7</th>
<th style="text-align: center;">8</th>
</tr>
</thead>
<tbody>
<tr>
<td>Decimal</td>
<td style="text-align: center;">128</td>
<td style="text-align: center;">64</td>
<td style="text-align: center;">32</td>
<td style="text-align: center;">16</td>
<td style="text-align: center;">8</td>
<td style="text-align: center;">4</td>
<td style="text-align: center;">2</td>
<td style="text-align: center;">1</td>
</tr>
<tr>
<td>Representation</td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
<td style="text-align: center;"></td>
</tr>
</tbody>
</table>

---

#### Convert `132` to Binary

Take the first octet of `132.12.1.23`.

1. Start from **128** → 132 ≥ 128 → put **1**, remainder = 132 − 128 = 4.
2. Next (64) → 4 < 64 → **0**.
3. Next (32) → 4 < 32 → **0**.
4. Next (16) → 4 < 16 → **0**.
5. Next (8) → 4 < 8 → **0**.
6. Next (4) → 4 ≥ 4 → **1**, remainder = 0.
7. Next (2) → 0 < 2 → **0**.
8. Next (1) → 0 < 1 → **0**.

Result row: **1 0 0 0 0 1 0 0**

<table class="study-table">
<thead>
<tr>
<th style="text-align: center;">Position</th>
<th style="text-align: center;">1</th>
<th style="text-align: center;">2</th>
<th style="text-align: center;">3</th>
<th style="text-align: center;">4</th>
<th style="text-align: center;">5</th>
<th style="text-align: center;">6</th>
<th style="text-align: center;">7</th>
<th style="text-align: center;">8</th>
</tr>
</thead>
<tbody>
<tr>
<td>Decimal</td>
<td style="text-align: center;">128</td>
<td style="text-align: center;">64</td>
<td style="text-align: center;">32</td>
<td style="text-align: center;">16</td>
<td style="text-align: center;">8</td>
<td style="text-align: center;">4</td>
<td style="text-align: center;">2</td>
<td style="text-align: center;">1</td>
</tr>
<tr>
<td>Representation</td>
<td style="text-align: center;">1</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">1</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
</tr>
</tbody>
</table>

👉 So `132` in binary = **10000100**

#### Convert 10000100 to Decimals

1. Take the binary `10000100`.
2. Multiply each bit by its place value:

   * 1×128 + 0×64 + 0×32 + 0×16 + 0×8 + 1×4 + 0×2 + 0×1
3. Add them up → **132**.

<table class="study-table">
<thead>
<tr>
<th style="text-align: center;">Position</th>
<th style="text-align: center;">1</th>
<th style="text-align: center;">2</th>
<th style="text-align: center;">3</th>
<th style="text-align: center;">4</th>
<th style="text-align: center;">5</th>
<th style="text-align: center;">6</th>
<th style="text-align: center;">7</th>
<th style="text-align: center;">8</th>
<th style="text-align: center;">Sum</th>
</tr>
</thead>
<tbody>
<tr>
<td>Decimal</td>
<td style="text-align: center;">128</td>
<td style="text-align: center;">64</td>
<td style="text-align: center;">32</td>
<td style="text-align: center;">16</td>
<td style="text-align: center;">8</td>
<td style="text-align: center;">4</td>
<td style="text-align: center;">2</td>
<td style="text-align: center;">1</td>
<td style="text-align: center;"></td>
</tr>
<tr>
<td>Bit</td>
<td style="text-align: center;">1</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">1</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;"></td>
</tr>
<tr>
<td>Value</td>
<td style="text-align: center;">128</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">4</td>
<td style="text-align: center;">0</td>
<td style="text-align: center;">0</td>
<td style="text-align: center; font-weight: bold;">132</td>
</tr>
</tbody>
</table>

👉 So `10000100` in decimal = **132**

---

## 🌐 NAT (Network Address Translation)

* Lets private IPs communicate with public IPs.
* Originally designed to conserve IPv4 addresses, also adds security.
* **Types:**
  * **Static NAT** → 1 private ↔ 1 public mapping.
  * **Dynamic NAT** → 1 private ↔ first available public from a pool (temporary).
  * **PAT (Port Address Translation)** → Many private IPs share 1 public; NAT gateway tracks Source IP+Port and rewrites to Public IP+Port. Your home Router is a good example.

---

## 🛡️ DDoS Attacks (3 categories)

1. **Volumetric** → Flood bandwidth.
2. **Protocol** → Abuse protocol weaknesses (SYN flood, Smurf).
3. **Application** → Target app layer (HTTP flood).

---

## 🌍 BGP (Border Gateway Protocol)

Think of the internet as a **network of networks**:

* Each big network (Google, Amazon, your ISP) is an **Autonomous System (AS)**.
* Each AS has a unique number, called an **ASN** (e.g., Google = **AS15169**, Amazon = **AS16509**).
* Inside an AS, the company controls all routing policies.
* Between ASes, they must **talk to each other** → that’s what **BGP (Border Gateway Protocol)** does.

<table class="study-table">
<thead>
<tr>
<th>Term</th>
<th>What it Means</th>
<th>Example</th>
</tr>
</thead>
<tbody>
<tr>
<td>AS (Autonomous System)</td>
<td>A collection of IP networks under one admin with one routing policy.</td>
<td>Google's AS15169, Amazon's AS16509, Cloudflare's AS13335</td>
</tr>
<tr>
<td>ASN</td>
<td>Autonomous System Number (unique ID).</td>
<td>Public (IANA/RIR assigned) / Private (64512–65534)</td>
</tr>
<tr>
<td>BGP</td>
<td>Protocol that connects ASes by exchanging route info.</td>
<td>Runs over TCP/179</td>
</tr>
<tr>
<td>iBGP</td>
<td>Routing <strong>inside</strong> an AS.</td>
<td>Google moving traffic between data centers.</td>
</tr>
<tr>
<td>eBGP</td>
<td>Routing <strong>between</strong> ASes.</td>
<td>ISP ↔ Google ↔ Amazon connections.</td>
</tr>
<tr>
<td>ASPATH</td>
<td>A list of AS hops to reach a network (shortest path usually wins).</td>
<td>Client → ISP (AS123) → Google (AS15169).</td>
</tr>
<tr>
<td>Tricks/Policies</td>
<td>Control routing with ASPATH prepending, filtering, or peering vs transit deals.</td>
<td>ISP may "prefer" cheaper peering routes.</td>
</tr>
</tbody>
</table>


---

## 📦 Jumbo Frames

* Default MTU = 1500 bytes; Jumbo = 9000 bytes.
* Benefits: less overhead, higher throughput.
* **Limitations:** Not supported over internet, VPN, or inter-region peering.
* **Supported:** Same-region peering, Direct Connect, TGW.

---

## 🔐 Layer 7 - Firewall

* Traditional firewalls work at L3/L4 (IP, ports) or L5 (stateful sessions).
* **L7 Firewall:** Understands app protocols (HTTP, DNS, etc.).

  * Detects protocol-specific attacks (e.g., HTTP floods).
  * Can filter by headers, content, rates.
* Example: AWS CloudFront with WAF for HTTP filtering.

---



## Casting

<table class="study-table">
<thead>
<tr>
<th>Cast Type</th>
<th>Who Receives</th>
<th>Example</th>
<th>OSI Level</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Broadcast</strong></td>
<td>Everyone in subnet</td>
<td>ARP requests</td>
<td>L2</td>
</tr>
<tr>
<td><strong>Unicast</strong></td>
<td>One specific host</td>
<td>Accessing a website</td>
<td>L3 (IP)</td>
</tr>
<tr>
<td><strong>Multicast</strong></td>
<td>Group of hosts (opt-in)</td>
<td>IPTV, video conference</td>
<td>L3 (IP Multicast)</td>
</tr>
<tr>
<td><strong>Anycast</strong></td>
<td>Closest host (routing)</td>
<td>DNS root servers</td>
<td>L3</td>
</tr>
<tr>
<td><strong>Geocast</strong></td>
<td>Hosts in a region</td>
<td>Vehicle-to-vehicle alerts</td>
<td>L3 (conceptual)</td>
</tr>
</tbody>
</table>

VLAN - Draws a invisible boundary inside the same Physical Switch, allowing L2 Broadcast to be "VLAN" Specific. This is done by VLAN tagging (IEEE 802.1Q) inserts a 4-byte header into the Ethernet frame between the Source MAC and EtherType, containing a 12-bit VLAN ID that tells switches which VLAN the frame belongs to.