import React from 'react';
import { Card, Skeleton, Tag, Button, Typography, Space, Popover } from 'antd';

const { Text } = Typography;

import './styles/hs-widget.less';

import en from './data/en.json';
import ErrorBoundary from './ErrorBoundary.jsx';
import WidgetSkeleton from './WidgetSkeleton.jsx';
import Logo from './Logo.jsx';
import EntityInfo from './EntityInfo.jsx';
import Error from './Error.jsx';
import HSButton from './HSButton.jsx';
import VerticalList from './VerticalList.jsx';

var controller = new AbortController();
var signal = controller.signal;

const noVerticals = ["Government", "Investor", "Accelerator / Incubator"];

const normalizeLocation = uniqueKey => {
  if (!uniqueKey) {
    return null;
  }
  const city = uniqueKey.match(/^[^:]+(::[^:]+){3}/)[0];
  const province = uniqueKey.match(/^[^:]+(::[^:]+){2}/)[0];
  const country = uniqueKey.match(/^[^:]+(::[^:]+){1}/)[0];

  return `${city ? en[city] + ", " : ""}${province ? en[province] + ", " : ""}${country ? en[country] : ""}`;
}

const normalizeType = uniqueKey => {
  if (!uniqueKey) {
    return null;
  }
  return en[uniqueKey.match(/^[^:]+::[^:]+/)[0]] || null;
}

const normalizeUrl = url => {
  return encodeURIComponent(url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, ''));
}

const WidgetCard = props => {
  return (
    <Card
      className='popup'>
      <WidgetSkeleton loading={props.loading && !(props.error)}/>
      <Error visible={props.error} imageSrc={props.wpObject.images + '/Warning.png'}/>
      <Space direction='vertical' align='center' size={0}>
        <Logo
          src={'http://logo.hockeystick.co/' + normalizeUrl(props.wpObject.atts.url) + '?size=' + 106}
          placeholder={props.wpObject.images + '/Placeholder_Logo.png'}
          visible={props.loading || props.error ? 0 : 1}/>
        <EntityInfo className='entityName' content={props.facts["Operating Name"] || props.facts["Legal Name"]}/>
        <EntityInfo className='entityType' content={normalizeType(props.facts["Organization Type"])}/>
        <EntityInfo className='entityLocation' content={normalizeLocation(props.facts["Location"])}/>
        <VerticalList
          visible={props.facts['Verticals'].length && !noVerticals.includes(normalizeType(props.facts["Organization Type"]))}
          verticals={props.facts['Verticals']}/>
        <EntityInfo className='entityDesc' content={props.facts["Short Description"] && (props.facts["Short Description"].substring(0, 140) + (props.facts["Short Description"].length > 140 ? "..." : ""))}/>
        <HSButton
          href={`https://www.hockeystick.co/entities/${props.facts['id']}`}
          className='hsButton'
          visible={props.loading || props.error ? 0 : 1}/>
      </Space>
      <img
        className={props.error ? 'hidden' : 'powered'}
        src={props.wpObject.images + '/Powered_By_HS.png'}
        style={{'marginTop': '20px'}}/>
    </Card>
  );
}

async function fetchCompanyInfo(domain) {
  let facts = {"Verticals": []};
  const query = `
    query SearchQuery ($domain: String) {
      view(datasets: ["public"]) {
        search(type: ENTITY, sortOrder: null, first: 1, conceptFilters: [{string: {like: $domain}, uniqueKey: "Entity::Domain"}]) {
          count
          edges {
            node {
              ... on Entity {
                id
                facts {
                  value
                  concept {
                    name
                    uniqueKey
                  }
                  option {
                    name
                    uniqueKey
                  }
                }
                offices {
                  id
                  facts {
                    concept {
                      name
                      uniqueKey
                    }
                    value
                    option {
                      name
                      uniqueKey
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  let response = await fetchData(query, 'https://graph.rc.hkst.io/', {domain});
  let {
    "data":{
      "view":{
        "search":{
          "edges":[
            {
              "node":{
                "facts":factArray,
                "id": id,
                "offices":officeArray
              }
            }
          ]
        }
      }
    }
  } = response;

  facts["id"] = id;

  factArray.forEach((fact) => {
    const {
      "concept": {"uniqueKey": uniqueKey, "name": name},
      "option": option,
      "value": value
    } = fact;
    if (uniqueKey == "Entity::Vertical") {
      facts["Verticals"].push((option && option.name) || value);
    } else {
      facts[name] = value;
    }
  });

  let headquarters = getHeadquarters(officeArray);

  // Ignore non-headquarter offices
  const officeFacts = (headquarters && headquarters["facts"]) || [];
  officeFacts.forEach(officeFact => {
    const {"concept": {"name": name}, "value": value} = officeFact;
    facts[name] = value;
  });
  return facts;
}

function fetchData(query, url, variables) {
  let response = fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables
    }),
    referrerPolicy: 'origin',
    signal: signal
  })
    .then(r => r.json());
  return response;
}

// Takes an array of structures representing offices, and returns one with
// "OfficeType::Headquarter" as its value for "Office Type", if one exists.
const getHeadquarters = offices => {
  if (!offices) {
    return null;
  }
  return offices.find(
    office => {
      if (!office.facts) {
        return false;
      }
      return office.facts.find(
        fact => {
          return fact &&
          fact.concept &&
          fact.concept.uniqueKey &&
          fact.value &&
          fact.concept.uniqueKey == 'Office::OfficeType' &&
          fact.value == 'OfficeType::Headquarter';
        }
      );
    }
  ) || null;
}

class HockeystickWidget extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      loading: true,
      visible: false,
      error: false,
      facts: {"Verticals": []},
    };
  }

  handleVisibleChange = visible => {
    this.setState({
      visible: visible
    });

    // Abort the request if the Popover is closed
    if (!visible) {
      controller.abort();
      controller = new AbortController();
      signal = controller.signal;
    }

    if (this.state.loading && visible) {
      fetchCompanyInfo(normalizeUrl(this.props.wpObject.atts.url))
        .then(
          (result) => {
            this.setState({
              loading: false,
              facts: result
            });
          },
          (e) => {
            console.log(e);
            if (e.name != "AbortError") {
              this.setState({
                error: true
              });
            }
          }
        );
    }
  };


  render() {
    return (
      <>
        <div id='with-antd-styles' className='trigger' ref={this.ref}>
          <Popover
            overlayClassName='no-padding'
            content={
              <ErrorBoundary imgSrc={this.props.wpObject.images + '/Warning.png'}>
                <WidgetCard
                  {...this.state}
                  {...this.props}
                />
              </ErrorBoundary>
            }
            placement='rightBottom'
            trigger='click'
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
            getPopupContainer={() => {return this.ref.current}}
          >
            <Text underline>{this.props.wpObject.content}</Text>
            <img src={this.props.wpObject.images + '/info-gold.png'} style={{width: "16px", display: "inline", marginLeft: "3px"}}/>
          </Popover>
          <div className={this.state.visible ? 'background' : 'hidden'}/>
        </div>
      </>
    );
  }
}

export default (HockeystickWidget);
