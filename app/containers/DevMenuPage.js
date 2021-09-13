// @flow
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { showDevTools } from '../actions/electron';
import DevMenu from '../components/DevMenu';
import type { stateType } from '../reducers/types';
import { resetCache } from '../actions/cache';
import { resetConfiguration } from '../actions/configuration';
import { logout } from '../actions/bot';

function mapStateToProps(state: stateType) {
  return {
    views: state.electron.views
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { showDevTools, resetConfiguration, resetCache, logout },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DevMenu);
