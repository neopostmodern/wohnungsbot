import React from "react";
import styles from "./Placeholder.scss";
// @ts-expect-error - flow doesn't like SVG
import BotIllustrationActive from "../../resources/bot-active.svg";

const Placeholder = () => <div className={styles.container}>
    <img src={BotIllustrationActive} alt="bot" />
    <h1>Wohnungsbot</h1>
  </div>;

export default Placeholder;