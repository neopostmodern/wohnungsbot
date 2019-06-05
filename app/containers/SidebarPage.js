import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import {
  clickLogin,
  electronRouting,
  showConfiguration
} from '../actions/electron';

function mapStateToProps(state) {
  return {
    puppet: state.electron.views.puppet,
    data: state.data
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { clickLogin, electronRouting, showConfiguration },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
