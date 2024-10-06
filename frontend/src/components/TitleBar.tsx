import { AppBar, Box, Card, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from "@mui/material";
import { ThreeDRotation } from '@mui/icons-material';

function TitleBar(props: { isDiscovering: boolean; devices: [{name: string, mac: string, conn_status: string}] | undefined }) {
    let list;
    if (props.devices === undefined) {
        list = (
            <Typography variant="subtitle2">Searching...</Typography>
        );
    } else {
        list = props.devices.map((device) => {
            return (
                <ListItem>
                    <ListItemAvatar>
                        <ThreeDRotation/>
                    </ListItemAvatar>
                    <ListItemText
                        primary={device.name}
                        secondary={device.mac}
                    />
                </ListItem>
            )
        })
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
                width: "50%",
            }}>
                <Card
                    sx={{ padding: "10px" }}
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