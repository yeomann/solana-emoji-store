export const areWeOnDevnet = () => {
  if(process.env.NEXT_PUBLIC_SOL_NETWORK === "dev") return true;
  return false;
}