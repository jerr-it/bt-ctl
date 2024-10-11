import { useEffect, useState } from 'react';
import './App.css';
import TitleBar from './components/TitleBar';
import BtDevice from './models/bt_device';

function App() {
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState<[BtDevice]>();

  useEffect(() => {
    fetch(
      "/start_discovery", { 
        method: "POST",
      }
    ).then((response) => {
      if (response.status === 200) {
        setDiscovering(true);

        setInterval(() => {
          fetch(
            "/list_devs", {
              method: "GET",
            }
          ).then(async (response) => {
            const body = await response.json();
            setDevices(body);
          });
        }, 3000);
      }
    });
  }, []);

  return (
    <div className="App">
      <TitleBar 
        isDiscovering={discovering}
        devices={devices}
      ></TitleBar>
    </div>
  );
}

export default App;
