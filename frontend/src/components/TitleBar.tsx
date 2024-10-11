import { AppBar, Box, Card, LinearProgress, List, Stack, Typography } from "@mui/material";
import BtDevice from "../models/bt_device";
import BtDeviceItem from "./BtDeviceItem";

function TitleBar(props: { isDiscovering: boolean; devices: [BtDevice] | undefined }) {
    let list;
    if (props.devices === undefined) {
        list = (
            <Typography variant="subtitle2">Searching...</Typography>
        );
    } else {
        list = props.devices
            .filter((dev) => dev.name !== "Unnamed device")
            .sort((a, b) => { return a.name.localeCompare(b.name); })
            .map((device) => {
                return (
                    <BtDeviceItem device={device}></BtDeviceItem>
                );
            }
        );
    }
    
    return (
        <Box sx={{
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <AppBar position="static">
                <Typography variant="h3">
                    Bt-Ctl
                </Typography>
            </AppBar>
            <Box sx={{ width: props.isDiscovering ? "100%" : "0%" }}>
                <LinearProgress/>
            </Box>
            <Box sx={{
                maxWidth: 600,
                minWidth: 300,
                width: "95%",
            }}>
                <Card
                    sx={{ padding: "10px", margin: "10px" }}
                >
                    <Stack direction="row">
                        <Typography>Devices</Typography>
                    </Stack>
                    <List>
                        {list}
                    </List>
                </Card>
            </Box>
        </Box>
    );
}

export default TitleBar;