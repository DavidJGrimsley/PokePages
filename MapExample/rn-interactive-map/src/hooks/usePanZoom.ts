import { useState, useRef } from 'react';
import { PanResponder } from 'react-native';

const usePanZoom = () => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastScale = useRef(1);
  const lastPosition = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: (evt, gestureState) => {
        lastPosition.current = { x: position.x, y: position.y };
      },
      onPanResponderMove: (evt, gestureState) => {
        setPosition({
          x: lastPosition.current.x + gestureState.dx,
          y: lastPosition.current.y + gestureState.dy,
        });
      },
      onPanResponderRelease: () => {
        lastPosition.current = position;
      },
    })
  ).current;

  const handlePinch = (event) => {
    if (event.nativeEvent.scale !== lastScale.current) {
      setScale(event.nativeEvent.scale);
      lastScale.current = event.nativeEvent.scale;
    }
  };

  return {
    scale,
    position,
    panResponder,
    handlePinch,
  };
};

export default usePanZoom;