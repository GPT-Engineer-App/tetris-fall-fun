import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Flex, Heading, Text, useInterval, VStack } from "@chakra-ui/react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const SHAPES = [
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  [
    [4, 4],
    [4, 4],
  ],
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
];

const COLORS = ["#000000", "#FF0D72", "#0DC2FF", "#0DFF72", "#F538FF", "#FF8E0D", "#FFE138", "#3877FF"];

const Tetris = () => {
  const [board, setBoard] = useState(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
  const [currentShape, setCurrentShape] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({
    x: 0,
    y: 0,
  });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [highScores, setHighScores] = useState([]);

  const gameRef = useRef(null);

  const resetGame = () => {
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
    setCurrentShape(null);
    setCurrentPosition({ x: 0, y: 0 });
    setScore(0);
    setLevel(1);
    setIsRunning(true);
  };

  const getRandomShape = () => {
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    return SHAPES[randomIndex];
  };

  const isValidPosition = (shape, position) => {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] && (board[row + position.y] === undefined || board[row + position.y][col + position.x] === undefined || board[row + position.y][col + position.x])) {
          return false;
        }
      }
    }
    return true;
  };

  const rotateShape = (shape) => {
    const rotatedShape = shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
    if (isValidPosition(rotatedShape, currentPosition)) {
      setCurrentShape(rotatedShape);
    }
  };

  const moveLeft = () => {
    const newPosition = { ...currentPosition, x: currentPosition.x - 1 };
    if (isValidPosition(currentShape, newPosition)) {
      setCurrentPosition(newPosition);
    }
  };

  const moveRight = () => {
    const newPosition = { ...currentPosition, x: currentPosition.x + 1 };
    if (isValidPosition(currentShape, newPosition)) {
      setCurrentPosition(newPosition);
    }
  };

  const moveDown = () => {
    const newPosition = { ...currentPosition, y: currentPosition.y + 1 };
    if (isValidPosition(currentShape, newPosition)) {
      setCurrentPosition(newPosition);
    } else {
      mergeShape();
      resetPosition();
    }
  };

  const dropDown = () => {
    let newPosition = { ...currentPosition };
    while (isValidPosition(currentShape, newPosition)) {
      newPosition = { ...newPosition, y: newPosition.y + 1 };
    }
    setCurrentPosition({ ...newPosition, y: newPosition.y - 1 });
  };

  const mergeShape = () => {
    const newBoard = [...board];
    for (let row = 0; row < currentShape.length; row++) {
      for (let col = 0; col < currentShape[row].length; col++) {
        if (currentShape[row][col]) {
          newBoard[row + currentPosition.y][col + currentPosition.x] = currentShape[row][col];
        }
      }
    }
    setBoard(newBoard);
  };

  const resetPosition = () => {
    setCurrentShape(null);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  };

  const clearRows = () => {
    const newBoard = board.filter((row) => !row.every((cell) => cell));
    const clearedRows = BOARD_HEIGHT - newBoard.length;
    setBoard([...Array(clearedRows).fill(Array(BOARD_WIDTH).fill(0)), ...newBoard]);
    setScore((prevScore) => prevScore + clearedRows * clearedRows * 100);
  };

  const updateHighScores = () => {
    const newHighScores = [...highScores, score].sort((a, b) => b - a);
    setHighScores(newHighScores.slice(0, 5));
  };

  const handleKeyDown = (event) => {
    if (!isRunning) return;

    switch (event.keyCode) {
      case 37:
        moveLeft();
        break;
      case 39:
        moveRight();
        break;
      case 40:
        moveDown();
        break;
      case 38:
        rotateShape(currentShape);
        break;
      case 32:
        dropDown();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (currentShape === null) {
      setCurrentShape(getRandomShape());
      setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  }, [currentShape]);

  useEffect(() => {
    if (score > 0 && score % 1000 === 0) {
      setLevel((prevLevel) => prevLevel + 1);
    }
  }, [score]);

  useEffect(() => {
    const intervalId = setInterval(
      () => {
        if (isRunning) {
          moveDown();
        }
      },
      1000 - level * 100,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, level]);

  useEffect(() => {
    clearRows();
  }, [board]);

  useEffect(() => {
    if (!isRunning) {
      updateHighScores();
    }
  }, [isRunning]);

  useEffect(() => {
    gameRef.current.focus();
  }, []);

  return (
    <Box ref={gameRef} tabIndex="0" onKeyDown={handleKeyDown} outline="none">
      <Flex justify="center" align="center" h="100vh">
        <VStack spacing={8}>
          <Heading as="h1" size="2xl">
            Tetris
          </Heading>
          <Flex>
            <Box border="2px solid" borderColor="gray.200" w={BOARD_WIDTH * BLOCK_SIZE} h={BOARD_HEIGHT * BLOCK_SIZE} position="relative">
              {board.map((row, y) => row.map((cell, x) => <Box key={`${x}-${y}`} position="absolute" top={y * BLOCK_SIZE} left={x * BLOCK_SIZE} w={BLOCK_SIZE} h={BLOCK_SIZE} bg={COLORS[cell]} border={cell ? "2px solid" : "none"} borderColor="gray.500" />))}
              {currentShape &&
                currentShape.map((row, y) =>
                  row.map((cell, x) => {
                    if (cell) {
                      return <Box key={`${x}-${y}`} position="absolute" top={(y + currentPosition.y) * BLOCK_SIZE} left={(x + currentPosition.x) * BLOCK_SIZE} w={BLOCK_SIZE} h={BLOCK_SIZE} bg={COLORS[cell]} border="2px solid" borderColor="gray.500" />;
                    }
                    return null;
                  }),
                )}
            </Box>
            <VStack ml={8} spacing={4} align="flex-start">
              <Text fontSize="xl">Score: {score}</Text>
              <Text fontSize="xl">Level: {level}</Text>
              <Text fontSize="xl">Next Shape:</Text>
              <Box border="2px solid" borderColor="gray.200" w={BLOCK_SIZE * 4} h={BLOCK_SIZE * 4}>
                {currentShape &&
                  currentShape.map((row, y) =>
                    row.map((cell, x) => {
                      if (cell) {
                        return <Box key={`${x}-${y}`} position="absolute" top={y * BLOCK_SIZE} left={x * BLOCK_SIZE} w={BLOCK_SIZE} h={BLOCK_SIZE} bg={COLORS[cell]} border="2px solid" borderColor="gray.500" />;
                      }
                      return null;
                    }),
                  )}
              </Box>
              <Button colorScheme="blue" onClick={() => setIsRunning(!isRunning)}>
                {isRunning ? "Pause" : "Resume"}
              </Button>
              <Button colorScheme="red" onClick={resetGame}>
                Reset
              </Button>
            </VStack>
          </Flex>
          <VStack spacing={4}>
            <Heading as="h2" size="lg">
              High Scores
            </Heading>
            {highScores.map((score, index) => (
              <Text key={index} fontSize="xl">
                {index + 1}. {score}
              </Text>
            ))}
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default Tetris;
