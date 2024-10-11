import { Bluetooth, Headphones, Smartphone, SportsEsports, VolumeUp } from "@mui/icons-material";

export default class BtDevice {
    name: string;
    mac: string;
    icon: string | null;

    blocked: boolean;
    paired: boolean;
    bonded: boolean;
    connected: boolean;

    constructor() {
        this.name = "Unnamed device";
        this.mac = "";
        this.icon = "None";

        this.blocked = false;
        this.paired = false;
        this.bonded = false;
        this.connected = false;
    }
}

export const CLASS_ICON_MAP: Record<string, JSX.Element> = {
    "audio-headphones": <Headphones/>,
    "input-gaming": <SportsEsports/>,
    "audio-card": <VolumeUp/>,
    "phone": <Smartphone/>,
};

export const DEFAULT_ICON = <Bluetooth/>;