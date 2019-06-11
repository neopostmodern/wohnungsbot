import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { showConfiguration } from '../actions/electron';
import { clickLogin, returnToSearchPage } from '../actions/bot';

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
