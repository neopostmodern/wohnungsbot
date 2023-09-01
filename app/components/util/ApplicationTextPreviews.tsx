import React from "react";
import type { FlatAddress, FlatContactDetails } from "../../reducers/data";
import styles from "../Configuration.scss";
import applicationTextBuilder from "../../flat/applicationTextBuilder";
type ApplicationTextPreviewsProps = {
  applicationText: string;
  className: string;
};
type ApplicationTextPreviewsState = {
  previewIndex: number;
};
export default class ApplicationTextPreviews extends React.Component<ApplicationTextPreviewsProps, ApplicationTextPreviewsState> {
  props: ApplicationTextPreviewsProps;
  state: ApplicationTextPreviewsState;
  static TestFlats: Array<{
    address: FlatAddress;
    contact: FlatContactDetails;
  }> = [{
    address: {
      street: 'Hermannstr.',
      houseNumber: '177',
      neighborhood: 'Neukölln',
      postcode: '12051'
    },
    contact: {
      firstName: 'Helga',
      lastName: 'Schneider',
      salutation: 'FEMALE'
    }
  }, {
    address: {
      street: 'Richardplatz',
      neighborhood: 'Neukölln',
      postcode: '12055'
    },
    contact: {
      salutation: 'NO_SALUTATION'
    }
  }, {
    address: {
      neighborhood: 'Neukölln',
      postcode: '12049'
    },
    contact: {
      salutation: 'MALE',
      firstName: 'Richard',
      lastName: 'Meier'
    }
  }];

  constructor() {
    super();
    this.state = {
      previewIndex: 0
    };
    setInterval(() => this.setState((previousState: ApplicationTextPreviewsState) => ({
      previewIndex: (previousState.previewIndex + 1) % ApplicationTextPreviews.TestFlats.length
    })), 5000);
  }

  render() {
    const {
      applicationText,
      className
    } = this.props;
    const {
      previewIndex
    } = this.state;
    return <>
        <pre className={className}>
          {applicationTextBuilder(applicationText, ApplicationTextPreviews.TestFlats[previewIndex].address, ApplicationTextPreviews.TestFlats[previewIndex].contact)}
        </pre>
        <div className={styles.comment}>
          Beispiel {previewIndex + 1} von{' '}
          {ApplicationTextPreviews.TestFlats.length}
        </div>
      </>;
  }

}