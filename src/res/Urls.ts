const BaseUrl = 'https://heroku-puzzle.herokuapp.com/';

export const PuzzlesUrl = `${BaseUrl}/puzzles.json`;

export const CoverUrl = (puzzleId: string) => `${BaseUrl}/images/${puzzleId}/cover.png`;

export const PieceUrl = (puzzleId: string, pieceId: string) => `${BaseUrl}/images/${puzzleId}/${pieceId}.png`;
