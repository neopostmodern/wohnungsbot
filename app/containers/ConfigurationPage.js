// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Configuration from '../components/Configuration';

import {
  nextStage,
  previousStage,
  togglePostcode,
  resetPostcodes,
  toggleFloor,
  toggleBoolean,
  setNumber
} from '../actions/configuration';
import { hideConfiguration } from '../actions/electron';

function mapStateToProps(state) {
  return {
    configuration: state.configuration
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      nextStage,
      previousStage,
      hideConfiguration,
      togglePostcode,
      resetPostcodes,
      toggleFloor,
      toggleBoolean,
      setNumber
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Configuration);
