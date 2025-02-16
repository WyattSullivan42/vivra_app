"use client";
import { FC } from "react";

import { useDisclosure } from "@mantine/hooks";
import {
  ActionIcon,
  Box,
  Burger,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";

import {useEffect, useState} from "react";

import classes from "./Header.module.css";
import { Drawer } from "../drawer/Drawer";
import Image from "next/image";

export const Header: FC = () => {
  let bleDevice = null;
  let bleServer = null;
  let bleService = null;
  let bleCharacteristic = null;

  const SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0"; // Custom Service UUID
  const CHARACTERISTIC_UUID = "abcdefab-cdef-1234-5678-abcdefabcdef"; // Custom Characteristic UUID

  const [opened, { toggle, close }] = useDisclosure(false);
  const { setColorScheme } = useMantineColorScheme();
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);

  const colorMode = useComputedColorScheme("light");

  function handleNotifications(event: Event) {
    const target = event.target as BluetoothRemoteGATTCharacteristic; // Type assertion

    if (target && target.value) {
      const value = new TextDecoder().decode(target.value);
      console.log("Received:", value);
    }
  }

  const bluetoothConnect = async () => {  
    try {
      console.log("Requesting Bluetooth Device...");
      bleDevice = await navigator.bluetooth.requestDevice({ //This shows and error but is only ran if SSR is done, so not a real issue
          acceptAllDevices: true,
          optionalServices: [SERVICE_UUID]
      });

      console.log("Connecting to GATT Server...");
      bleServer = await bleDevice.gatt?.connect();

      console.log("Getting Service...");
      bleService = await bleServer?.getPrimaryService(SERVICE_UUID);

      console.log("Getting Characteristic...");
      bleCharacteristic = await bleService?.getCharacteristic(CHARACTERISTIC_UUID);

      console.log("Connected! Waiting for data...");

      // Enable notifications
      await bleCharacteristic?.startNotifications();
      bleCharacteristic?.addEventListener("characteristicvaluechanged", handleNotifications);

    } catch (error) {
        console.log("Error:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "bluetooth" in navigator) {
      setIsBluetoothSupported(true);
    } else {
      setIsBluetoothSupported(false);
    }
  }, []);


  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Burger
          className={classes.burger}
          opened={opened}
          onClick={toggle}
          size="sm"
        />
        <Drawer opened={opened} close={close}></Drawer>
        <Box className={classes.vivra_icon}>
          <Image
            key={colorMode}
            priority
            alt="vivra icon"
            src={
              colorMode == "dark"
                ? "/assets/icons/vivra-dark.svg"
                : "/assets/icons/vivra-light.svg"
            }
            width={56}
            height={56}
          ></Image>
        </Box>
        <div className={classes.icons}>
          <ActionIcon
          className={classes.action_icon}
          variant="outline"
          color={colorMode == "dark" ? "yellow" : "dark.7"}
          title="Color Scheme Toggle"
          onClick={() => {if (isBluetoothSupported) {
            bluetoothConnect();
            } else {
              console.log("Bluetooth not supported");
            }}
          }
          >
          <Image
            alt={colorMode == "dark" ? "sun icon" : "moon icon"}
            className={classes.color_icon}
            src={
              colorMode == "dark"
                ? "/assets/icons/bluetooth-brands-solid.svg"
                : "/assets/icons/bluetooth-brands-solid.svg"
            }
            height={18}
            width={18}
          />
          </ActionIcon>
          <ActionIcon
            className={classes.action_icon}
            variant="outline"
            color={colorMode == "dark" ? "yellow" : "dark.7"}
            title="Color Scheme Toggle"
            onClick={() =>
              setColorScheme(colorMode === "light" ? "dark" : "light")
            }
          >
            <Image
              alt={colorMode == "dark" ? "sun icon" : "moon icon"}
              className={classes.color_icon}
              src={
                colorMode == "dark"
                  ? "/assets/icons/sun-icon.svg"
                  : "/assets/icons/moon-solid.svg"
              }
              height={18}
              width={18}
            />
          </ActionIcon>
        </div>
      </div>
    </header>
  );
};