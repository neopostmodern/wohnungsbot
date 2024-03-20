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
  setNumber,
  setString,
  resetConfiguration
} from '../actions/configuration';
import { hideConfiguration } from '../actions/electron';

function mapStateToProps(state) {
  return {
    configuration: state.configuration
  };
}

function mapDispatchToProps(dispatch) { // how frontend interacts with configuration state
  return bindActionCreators(
    {
      nextStage,
      previousStage,
      hideConfiguration,
      togglePostcode,
      resetPostcodes,
      toggleFloor,
      toggleBoolean,
      setNumber,
      setString,
      resetConfiguration
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);
