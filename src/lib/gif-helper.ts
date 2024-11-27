import { difficultyMapping } from '@/components/game'

export function getPuzzleFeedback(
  difficulty: keyof typeof difficultyMapping,
  moves: number
) {
  let defaultMessage =
    "Congratulations, you've completed the puzzle! Try for fewer moves next time!"
  let defaultGif = '/assets/clapping.gif' // Default clapping GIF

  const messagesAndGifs = {
    easy: [
      {
        maxMoves: 10,
        message: 'Outstanding! You solved it in record time!',
        gif: '/assets/outstanding.webp',
      },
      {
        maxMoves: 12,
        message: 'WOW! You are a genius!',
        gif: '/assets/wow.webp',
      },
      {
        maxMoves: 20,
        message: `Great job! You solved it in {moves} moves!`,
        gif: '/assets/great_job.webp',
      },
      {
        maxMoves: Infinity,
        message: `You completed it in {moves} moves. Keep improving!`,
        gif: '/assets/completed.webp',
      },
    ],
    medium: [
      {
        maxMoves: 15,
        message: `Phenomenal! {moves} moves? You're unstoppable!`,
        gif: '/assets/no.gif',
      },
      {
        maxMoves: 20,
        message: `Impressive! You won in just {moves} moves—what a pro!`,
        gif: '/assets/hard.gif', // invalid
      },
      {
        maxMoves: 25,
        message: `Nice work! {moves} moves—solid effort!`,
        gif: '/assets/nicework.webp',
      },
      {
        maxMoves: Infinity,
        message: `You solved it in {moves} moves! Try for fewer next time!`,
        gif: '/assets/ez.gif', // invalid
      },
    ],
    hard: [
      {
        maxMoves: 25,
        message: `Legendary! You cracked the hard puzzle in just {moves} moves!`,
        gif: '/assets/legendary.gif',
      },
      {
        maxMoves: 30,
        message: `You won in {moves} moves! You're a puzzle master!`,
        gif: '/assets/youwon.webp',
      },
      {
        maxMoves: 40,
        message: `Well done! {moves} moves is a solid performance!`,
        gif: '/assets/welldone.webp',
      },
      {
        maxMoves: Infinity,
        message: `You completed the challenge in {moves} moves. Great persistence!`,
        gif: '/assets/pro.gif',
      },
    ],
  }

  // Fallback for invalid difficulty
  const difficultyConfig = messagesAndGifs[difficulty]
  if (!difficultyConfig) return { message: defaultMessage, gif: defaultGif }

  for (const { maxMoves, message: msg, gif: gifUrl } of difficultyConfig) {
    if (moves <= maxMoves) {
      return {
        message: msg.replace('{moves}', String(moves)), // Replace placeholder with actual moves
        gif: gifUrl,
      }
    }
  }

  // Return default feedback if no match is found
  return { message: defaultMessage, gif: defaultGif }
}
