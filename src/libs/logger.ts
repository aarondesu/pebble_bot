import winston from "winston";
import chalk from "chalk";

function colorizeLevel(level: string): string {
  switch (level) {
    case "error":
      return chalk.bgRed.white(level);
    case "warn":
      return chalk.bgYellow.white(level);
    case "info":
      return chalk.bgGreen.white(level);
    case "debug":
      return chalk.bgBlue.white(level);
    default:
      return level;
  }
}

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((output) => {
    let outputMessage = output.message;
    if (output.message === "object")
      outputMessage = JSON.stringify(output.message);

    const level = colorizeLevel(output.level);

    // Check if have source
    if ("source" in output) {
      return `${chalk.blue(output.timestamp)} ${level} ${chalk.green(output.source)} ${chalk.white(outputMessage)}`;
    }
    return `${chalk.blue(output.timestamp)} ${level} ${chalk.white(outputMessage)}`;
  }),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (output) =>
      `${output.timestamp} ${output.level} ${output.source ?? ""} ${output.message}`,
  ),
);

const logger = winston.createLogger({
  level: "debug",
  format: consoleFormat,
  transports: [new winston.transports.Console()],
});

export default logger;
