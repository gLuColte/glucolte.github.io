---
title: osi model
permalink: /study/systemDesignOsiModel
---

# Osi Model

The OSI (Open Systems Interconnection) Model is a conceptual framework that explains how data moves from one device to another across a network. It breaks communication into seven layers, each with a specific role—from turning raw electrical signals into bits, all the way up to human-readable applications like web browsers or email. By separating these responsibilities, the OSI model makes it easier to design, troubleshoot, and scale networks. It supports everything from simple device-to-device communication (like two computers in a LAN) to complex many-to-many interactions across the global internet. Each higher OSI layer builds on the services of the layer below, while layers remain functionally independent when viewed side-by-side.

| OSI Layer           | Example Protocols        | Data Unit | What It Adds / Handles                                | Key Details & Examples                                                                                                                                                                                                   |
| ------------------- | ------------------------ | --------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **L7 Application**  | HTTP, DNS, SMTP, FTP     | Data      | User-facing services & protocols                      | Apps talk in human-readable formats. Browser → HTTP Request, Mail client → SMTP.                                                                                                                                         |
| **L6 Presentation** | TLS/SSL, JPEG, JSON      | Record    | Data format, encryption, compression                  | TLS encrypts HTTP; JSON/XML standardize data; JPEG/MP3 compress media. Often merged into L7 in practice.                                                                                                                 |
| **L5 Session**      | NetBIOS, RPC             | –         | Session control (setup, sync, teardown)               | Rarely explicit today. Example: RPC, NetBIOS. TLS sessions can resume without full handshake.                                                                                                                            |
| **L4 Transport**    | TCP, UDP                 | Segment   | Reliable delivery (TCP) or fast fire-and-forget (UDP) | Fixes L3 issues: out-of-order, loss, no channels. TCP headers include ports, seq/ack, window, checksum. TCP 3-way handshake → SYN, SYN/ACK, ACK. Maintains state (reliable, ordered). UDP = stateless (no session info). |
| **L3 Network**      | IP, ICMP                 | Packet    | Logical addressing, routing between networks          | IP = addressing system. ICMP = control (ping, errors). Routers strip/replace frames at every hop. Uses ARP to resolve IP→MAC. Routing tables decide next hop (default 0.0.0.0/0). House = IP, Apartment = Port.          |
| **L2 Data Link**    | Ethernet, Wi-Fi, PPP     | Frame     | Local delivery between devices on the same medium     | MAC addresses unique per device. Frame = Header (src/dst MAC + EtherType) + Payload (L3 packet) + CRC. Handles collisions (CSMA/CD). Supports unicast, broadcast, VLAN tagging. Protocols: Ethernet, Wi-Fi, MPLS, PPP.   |
| **L1 Physical**     | Copper, Fiber, Wi-Fi PHY | Bits      | Transmission of raw signals                           | Defines voltage, RF, or light wavelength. No addressing or error detection. Standards: copper (RJ45), fiber optics, Wi-Fi PHY.                                                                                           |


🔁 **Encapsulation order**:
**Frame → Packet → Segment → Application Data**
…and the whole frame turns into **bits/signals** at Layer 1.

A really good diagram illustration is from [Osi Model Explained - Byte Byte Go](https://bytebytego.com/guides/what-is-osi-model/)
![ByteByteGo OSI Model](https://assets.bytebytego.com/diagrams/0295-osi-model.jpeg)


---

## Devices at Different Layers

Different network devices operate at different OSI layers, each handling only the information relevant to its role:

| Device     | OSI Layer | What It Does                                                                                  |
| ---------- | --------- | --------------------------------------------------------------------------------------------- |
| **Hub**    | L1        | Blindly broadcasts bits to all ports. No MAC awareness → collisions possible.                 |
| **Switch** | L2        | Forwards frames based on MAC address table. Falls back to broadcast if unknown.               |
| **Router** | L3        | Forwards packets based on IP. Removes incoming frame header, adds a new one for the next hop. |


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

![L2 ARP Example](./assets/l2_arp.png)

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

![L3 Routing Example](./assets/l3_routing.png)

---

## Multi Layer 4 & 7 - TLS Handshake

TLS handshake for encrypted communication:

```
@startuml
actor Server
actor Client
actor CA

== Certificate Setup (before handshake) ==
Server -> CA: CSR (public key + org info)
CA -> Server: Signed Certificate (X.509)

== TCP 3-Way Handshake ==
Client -> Server: SYN
Server -> Client: SYN-ACK
Client -> Server: ACK
note over Client,Server: TCP connection established

== TLS Handshake ==
Client -> Server: ClientHello
Server -> Client: ServerHello + Certificate (signed by CA)
Client -> CA: Validate Certificate Chain
note over Client: Check CA root, expiry, domain
Client -> Server: Pre-Master Secret (encrypted)
note over Client,Server: Derive Master Secret & Session Keys

Client -> Server: Finished
Server -> Client: Finished
note over Client,Server: Secure TLS Channel Established

== Application Data ==
Client -> Server: Encrypted HTTP Request
Server -> Client: Encrypted HTTP Response
@enduml

```

![TLS Handhsake](./assets/tls_handshake.png)

---

## Commands by OSI Layer

| Layer              | Command            | Purpose                            | Example                                  | Popular Flags                             |
| ------------------ | ------------------ | ---------------------------------- | ---------------------------------------- | ----------------------------------------- |
| **L2** Data Link   | `arp`              | Show/modify ARP cache (IP↔MAC)     | `arp -a`                                 | `-a` all, `-d` delete                     |
|                    | `ip link`          | Manage NICs, errors, drops         | `ip -s link show eth0`                   | `-s` stats, `set` up/down                 |
|                    | `ethtool`          | NIC driver/speed info              | `ethtool eth0`                           | `-i` driver info, `-S` stats              |
| **L3** Network     | `ping`             | Test reachability + latency (ICMP) | `ping -c 4 8.8.8.8`                      | `-c` count, `-s` size, `-I` iface         |
|                    | `traceroute`/`mtr` | Show hop path                      | `mtr -rw 8.8.8.8`                        | `-r` report, `-n` numeric, `-w` wide      |
|                    | `ip route`         | Show/manage routing table          | `ip route show`                          | add/del routes                            |
| **L4** Transport   | `ss`/`netstat`     | List sockets, ports, states        | `ss -antp`                               | `-a` all, `-t` TCP, `-u` UDP, `-p` proc   |
|                    | `tcpdump`          | Capture packets                    | `tcpdump -i eth0 port 443 -nnvvXSs 1500` | `-i` iface, `-nn` no resolve, `-w` write  |
| **L7** Application | `dig`              | DNS resolution                     | `dig +trace example.com`                 | `+trace`, `@server`                       |
|                    | `nslookup`         | Legacy DNS tool                    | `nslookup example.com 8.8.8.8`           | server param                              |
|                    | `curl`             | Test HTTP/TLS endpoints            | `curl -vk https://example.com`           | `-v` verbose, `-k` ignore cert            |
|                    | `wget`             | Fetch HTTP/FTP files               | `wget --spider https://example.com`      | `--spider` test only, `-O` output         |
| **Cross**          | `iftop`            | Bandwidth by connection            | `iftop -i eth0`                          | `-n` numeric, `-P` show ports             |
|                    | `nmap`             | Scan ports/services                | `nmap -sS -p 1-1000 10.1.2.3`            | `-sS` SYN, `-sV` version, `-A` aggressive |


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

| Position           | 1   | 2  | 3  | 4  | 5 | 6 | 7 | 8 |
| ------------------ | --- | -- | -- | -- | - | - | - | - |
| **Decimal**        | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
| **Representation** |     |    |    |    |   |   |   |   |

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

| Position           | 1   | 2  | 3  | 4  | 5 | 6 | 7 | 8 |
| ------------------ | --- | -- | -- | -- | - | - | - | - |
| **Decimal**        | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
| **Representation** | 1   | 0  | 0  | 0  | 0 | 1 | 0 | 0 |

👉 So `132` in binary = **10000100**

#### Convert 10000100 to Decimals

1. Take the binary `10000100`.
2. Multiply each bit by its place value:

   * 1×128 + 0×64 + 0×32 + 0×16 + 0×8 + 1×4 + 0×2 + 0×1
3. Add them up → **132**.

| Position    | 1   | 2  | 3  | 4  | 5 | 6 | 7 | 8 | **Sum** |
| ----------- | --- | -- | -- | -- | - | - | - | - | ------- |
| **Decimal** | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |         |
| **Bit**     | 1   | 0  | 0  | 0  | 0 | 1 | 0 | 0 |         |
| **Value**   | 128 | 0  | 0  | 0  | 0 | 4 | 0 | 0 | **132** |

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

| Term                       | What it Means                                                                   | Example                                                  |
| -------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **AS (Autonomous System)** | A collection of IP networks under one admin with one routing policy.            | Google’s AS15169, Amazon’s AS16509, Cloudflare’s AS13335 |
| **ASN**                    | Autonomous System Number (unique ID).                                           | Public (IANA/RIR assigned) / Private (64512–65534)       |
| **BGP**                    | Protocol that connects ASes by exchanging route info.                           | Runs over TCP/179                                        |
| **iBGP**                   | Routing **inside** an AS.                                                       | Google moving traffic between data centers.              |
| **eBGP**                   | Routing **between** ASes.                                                       | ISP ↔ Google ↔ Amazon connections.                       |
| **ASPATH**                 | A list of AS hops to reach a network (shortest path usually wins).              | Client → ISP (AS123) → Google (AS15169).                 |
| **Tricks/Policies**        | Control routing with ASPATH prepending, filtering, or peering vs transit deals. | ISP may “prefer” cheaper peering routes.                 |


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

