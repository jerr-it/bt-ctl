import { BluetoothConnected, Close, LinkOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, ListItem, ListItemAvatar, ListItemText, Snackbar, Stack, Typography } from "@mui/material";
import BtDevice, { CLASS_ICON_MAP, DEFAULT_ICON } from "../models/bt_device";
import { useState } from "react";


export default function BtDeviceItem(props: {device: BtDevice }) {
    const [connectionChanging, setConnectionChanging] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [failureOpen, setFailureOpen] = useState(false);

    const onConnectClick = (mac: string) => {
        setConnectionChanging(true);

        fetch(
            "http://localhost:8080/connect_device", { 
                method: "POST",
                body: JSON.stringify(mac),
                headers: { "Content-Type": "application/json" }
            }
        ).then((response) => {
            setConnectionChanging(false);
            if (response.status === 200) { 
                setSuccessOpen(true);
            } else {
                setFailureOpen(true);
            }
        }).catch((err) => {
            setConnectionChanging(false);
            setFailureOpen(true);
        });
    };

    const onDisconnectClick = (mac: string) => {
        setConnectionChanging(true);

        fetch(
            "http://localhost:8080/disconnect_device", { 
                method: "POST",
                body: JSON.stringify(mac),
                headers: { "Content-Type": "application/json" }
            }
        ).then((response) => {
            setConnectionChanging(false);
            if (response.status === 200) {
                setSuccessOpen(true);
            } else {
                setFailureOpen(true);
            } 
        }).catch((err) => {
            setConnectionChanging(false);
            setFailureOpen(true);
        });
    };

    return (
        <ListItem secondaryAction={
            !props.device.connected ? 
            <Button variant="contained" startIcon={<BluetoothConnected/>} onClick={() => onConnectClick(props.device.mac)} disabled={connectionChanging}>Connect</Button>
            : <Button variant="contained" startIcon={<Close/>} color="error" onClick={() => onDisconnectClick(props.device.mac)} disabled={connectionChanging}>Disconnect</Button>
        }>
            <Snackbar open={successOpen} autoHideDuration={3000}>
                <Alert severity="success">
                    <AlertTitle>Success</AlertTitle>
                    Device is now connected.
                </Alert>
            </Snackbar>

            <Snackbar open={failureOpen} autoHideDuration={3000}>
                <Alert severity="error">
                    <AlertTitle>Failed</AlertTitle>
                    Failed to disconnect device
                </Alert>
            </Snackbar>

            <ListItemAvatar>
                {props.device.icon === null ? DEFAULT_ICON : CLASS_ICON_MAP[props.device.icon]}
            </ListItemAvatar>

            <ListItemText
                primary={
                    <Stack direction="row">
                        <Typography>{props.device.name}</Typography>
                        { props.device.connected ? <LinkOutlined sx={{ marginLeft: "10px" }} color="primary"/> : <Box></Box>}
                    </Stack>
                }
                secondary={props.device.mac}
            />
        </ListItem>
    );
}