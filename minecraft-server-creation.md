# Minecraft Bedrock Server on Niaj

This documents the working setup for Porter's Minecraft Bedrock development server on the QNAP NAS. The goal is to have enough information to recreate the server.

## Network

The relevant network layout is:

```text
Nintendo Switch
192.168.1.130
Monitored network
       |
     pfSense
       |
192.168.0.0/24
       |
Niaj (QNAP NAS)
192.168.0.4
       |
     Docker
       |
minecraft-dev
```

The Switch stays on the monitored network. pfSense allows that network to initiate connections to the network containing Niaj.

No special Minecraft pfSense firewall rule is required.

## QNAP / Container Station

The server runs in QNAP Container Station as an Application named:

```text
minecraft-dev
```

It uses:

```text
itzg/minecraft-bedrock-server:stable
```

Minecraft data is stored in an external Docker volume:

```text
minecraft-dev_minecraft-dev-data
```

This is important: the volume contains the world and other persistent server data. The Container Station application can be deleted and recreated without losing the world as long as this volume is not deleted.

Container Station does not provide a convenient way to edit an existing application's Compose YAML. To change the Compose configuration:

1. Delete the `minecraft-dev` application.
2. Keep `minecraft-dev_minecraft-dev-data`.
3. Recreate `minecraft-dev` with the updated Compose YAML.

## Docker Compose

Use this Compose configuration:

```yaml
services:
  minecraft:
    image: itzg/minecraft-bedrock-server:stable
    restart: unless-stopped
    environment:
      EULA: "TRUE"
      VERSION: "LATEST"
      TRANSPORT: "nethernet"
      SERVER_UDP_PORTS: "192.168.0.4:19140-19155:19140-19155"
      SERVER_NAME: "Porter's Minecraft Dev"
      GAMEMODE: creative
      DIFFICULTY: easy
      ALLOW_CHEATS: "true"
      ONLINE_MODE: "true"
      ALLOW_LIST: "false"
    ports:
      - "19132:19132/tcp"
      - "19140-19155:19140-19155/udp"
    volumes:
      - minecraft-dev-data:/data
    stdin_open: true
    tty: true

volumes:
  minecraft-dev-data:
    external: true
    name: minecraft-dev_minecraft-dev-data
```

### Important NetherNet setting

Keep this setting exactly as shown:

```yaml
SERVER_UDP_PORTS: "192.168.0.4:19140-19155:19140-19155"
```

Minecraft Bedrock uses NetherNet for networking. Because BDS runs inside Docker, it needs to advertise Niaj's reachable LAN address (`192.168.0.4`) rather than its private Docker address.

The server uses:

- TCP `19132` for NetherNet signaling.
- UDP `19140-19155` for the negotiated game connection.

## Nintendo Switch

Nintendo Switch Minecraft does not provide a normal Add Server option, so a BedrockConnect-style DNS redirection is used to reach the development server.
## Persistent Data

The Docker volume:

```text
minecraft-dev_minecraft-dev-data
```

is mounted in the container at:

```text
/data
```

The current world is:

```text
/data/worlds/Bedrock level
```

Behavior packs are stored under:

```text
/data/behavior_packs
```

Porter's development behavior pack is currently:

```text
/data/behavior_packs/porter-minecraft-dev
```

## Development Logging

For the development server, enable Minecraft content logging in `server.properties`:

```text
content-log-file-enabled=false
content-log-console-output-enabled=true
content-log-level=info
```

This allows JavaScript messages and Script API errors to appear in the normal Docker logs.

View logs with:

```bash
docker logs -f minecraft-dev-minecraft-1
```

Restart the server with:

```bash
docker restart minecraft-dev-minecraft-1
```
## Working M1 State

The setup is complete when:

- `minecraft-dev` is running in Container Station.
- The external data volume is mounted at `/data`.
- The Switch remains on the monitored network.
- The Switch can connect to `192.168.0.4`.
- The Minecraft world persists across container/application recreation.
- No special Minecraft pfSense firewall rule is required.