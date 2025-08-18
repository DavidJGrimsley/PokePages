import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DigitalClock = () => {
  const [date, setDate] = useState(new Date());
  // Placeholder temperature value
  const temperature = 24.6;

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  let ampm = true;
  ampm =  hours >= 12;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const weekday = days[date.getDay()];
  const isCelsius = true

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <Text style={styles.ampm}>{ampm ? 'PM' : 'AM'}</Text>
        <Text style={styles.time}>{`${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.date}>{`${month}/${day} ${weekday}`}</Text>
        <Text style={styles.temp}>{isCelsius ? `${temperature}°C` : `${(temperature * 9/5 + 32).toFixed(1)}°F`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    width: 250,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  ampm: {
    fontSize: 18,
    marginRight: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#222',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  date: {
    fontSize: 18,
    color: '#444',
    fontWeight: '500',
  },
  temp: {
    fontSize: 18,
    color: '#444',
    fontWeight: '500',
  },
});

export default DigitalClock;