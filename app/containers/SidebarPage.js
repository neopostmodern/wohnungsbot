import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import {
  clickLogin,
  returnToSearchPage,
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
    { clickLogin, returnToSearchPage, showConfiguration },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
