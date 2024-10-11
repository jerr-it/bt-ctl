import { BluetoothConnected, Close, LinkOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, ListItem, ListItemAvatar, ListItemText, Snackbar, Stack, Typography } from "@mui/material";
import BtDevice, { CLASS_ICON_MAP, DEFAULT_ICON } from "../models/bt_device";
import { useState } from "react";


export default function BtDeviceItem(props: {device: BtDevice }) {
    const [connectionChanging, setConnectionChanging] = useState(false);
    const [snackBarState, setSnackbarState] = useState<{open: boolean, severity: any, message: string}>({open: false, severity: "error", "message": "error"});

    const onConnectClick = (mac: string) => {
        setConnectionChanging(true);

        fetch(
            "http://localhost:8080/connect_device", { 
                method: "POST",
                body: JSON.stringify(mac),
                headers: { "Content-Type": "application/json" }
            }
        ).then(async (response) => {
            setConnectionChanging(false);
            if (response.status === 200) { 
                setSnackbarState({open: true, severity: "success", message: "Connected device!"});
            } else {
                let error = await response.json();
                setSnackbarState({open: true, severity: "error", message: error});
            }
        }).catch((err) => {
            setConnectionChanging(false);
            setSnackbarState({open: true, severity: "error", message: err});
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
        ).then(async (response) => {
            setConnectionChanging(false);
            if (response.status === 200) {
                setSnackbarState({open: true, severity: "success", message: "Disconnected device!"});
            } else {
                let error = await response.json();
                setSnackbarState({open: true, severity: "error", message: error});
            } 
        }).catch((err) => {
            setConnectionChanging(false);
            setSnackbarState({open: true, severity: "success", message: err});
        });
    };

    return (
        <ListItem secondaryAction={
            !props.device.connected ? 
            <Button variant="contained" startIcon={<BluetoothConnected/>} onClick={() => onConnectClick(props.device.mac)} disabled={connectionChanging}>Connect</Button>
            : <Button variant="contained" startIcon={<Close/>} color="error" onClick={() => onDisconnectClick(props.device.mac)} disabled={connectionChanging}>Disconnect</Button>
        }>
            <Snackbar open={snackBarState.open} autoHideDuration={3000}>
                <Alert severity={snackBarState.severity}>
                    <AlertTitle>{snackBarState.message}</AlertTitle>
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