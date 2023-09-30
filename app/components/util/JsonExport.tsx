import React from "react";
import styles from "./JsonExport.scss";
type JsonExportProps = {
  serializableObject: any;
};
type JsonExportState = {
  expanded: boolean;
};
export default class JsonExport extends React.Component<JsonExportProps, JsonExportState> {
  props: JsonExportProps;
  state: JsonExportState = {
    expanded: false
  };

  render() {
    const {
      expanded
    } = this.state;
    const {
      serializableObject
    } = this.props;

    if (!expanded) {
      return <div className={styles.trigger} onClick={() => this.setState({
        expanded: true
      })}>
          JSON Export
          <span className="material-icons">expand_more</span>
        </div>;
    }

    return <>
        <div className={styles.trigger} onClick={() => this.setState({
        expanded: false
      })}>
          JSON Export
          <span className="material-icons">expand_less</span>
        </div>
        <pre dangerouslySetInnerHTML={{
        __html: JSON.stringify(serializableObject, null, 2)
      }} className={styles.exportArea} />
      </>;
  }

}