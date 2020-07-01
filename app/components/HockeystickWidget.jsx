import React from 'react';
import { Card, Skeleton, Tag, Button, Typography, Space, Popover } from 'antd';

const { Text } = Typography;

import './styles/hockeystick-widget.less';

import en from './data/en.json';
import ErrorBoundary from './ErrorBoundary.jsx';
import WidgetSkeleton from './WidgetSkeleton.jsx';
import Logo from './Logo.jsx';
import EntityInfo from './EntityInfo.jsx';
import Error from './Error.jsx';
import HSButton from './HSButton.jsx';
import VerticalList from './VerticalList.jsx';

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

  // handleClickOutside = (e) => {
  //   console.log('handleClickOutside');
  //   this.setState({
  //     visible: false
  //   });
  //  };

  handleVisibleChange = visible => {
    this.setState({
      visible: visible
    });

    if (this.state.loading) {
      this.fetchCompanyInfo(encodeURIComponent(this.props.wpObject.atts.url))
        .then(
          (result) => {
            this.setState({
              loading: false,
              facts: result
            });
          },
          (error) => {
            console.log(error);
            this.setState({
              error: true
            });
          }
        );
    }
  };


  render() {
    const noVerticals = ["Government", "Investor", "Accelerator / Incubator"];

    const WidgetCard = props => {
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
        return en[uniqueKey.match(/^[^:]+::[^:]+/)] || null;
      }

      return (
        <ErrorBoundary imgSrc={props.wpObject.images + '/Warning.png'}>
          <Card
            className='popup'>
            <WidgetSkeleton loading={props.loading && !(props.error)}/>
            <Error visible={props.error} imageSrc={props.wpObject.images + '/Warning.png'}/>
            <Space direction='vertical' align='center' size={0}>
              <Logo
                src={'http://logo.hockeystick.co/' + encodeURIComponent(props.wpObject.atts.url) + '?size=' + 106}
                placeholder={props.wpObject.images + '/Placeholder_Logo.png'}
                visible={props.loading || props.error ? 0 : 1}/>
              <EntityInfo className='entityName' content={props.facts["Operating Name"] || props.facts["Legal Name"]}/>
              <EntityInfo className='entityType' content={normalizeType(props.facts["Organization Type"])}/>
              <EntityInfo className='entityLocation' content={normalizeLocation(props.facts["Location"])}/>
              <VerticalList
                visible={props.facts['Verticals'].length && !noVerticals.includes(normalizeType(props.facts["Organization Type"])) ? 1 : 0}
                verticals={props.facts['Verticals']}/>
              <EntityInfo className='entityDesc' content={props.facts["Short Description"]}/>
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
        </ErrorBoundary>
      );
    }

    // const card = (
    //   <Card
    //     className='popup'>
    //     <WidgetSkeleton loading={this.state.loading && !(this.state.error)}/>
    //     <Error visible={this.state.error} imageSrc={this.props.wpObject.images + '/Warning.png'}/>
    //     <Space direction='vertical' align='center' size={0}>
    //       <Logo
    //         src={'http://logo.hockeystick.co/' + encodeURIComponent(this.props.wpObject.atts.url) + '?size=' + 106}
    //         placeholder={this.props.wpObject.images + '/Placeholder_Logo.png'}
    //         visible={this.state.loading || this.state.error ? 0 : 1}/>
    //       <EntityInfo className='entityName' content={this.state.facts["Operating Name"] || this.state.facts["Legal Name"]}/>
    //       <EntityInfo className='entityType' content={this.normalizeType(this.state.facts["Organization Type"])}/>
    //       <EntityInfo className='entityLocation' content={this.normalizeLocation(this.state.facts["Location"])}/>
    //       <VerticalList
    //         visible={this.state.facts['Verticals'].length && !noVerticals.includes(this.normalizeType(this.state.facts["Organization Type"])) ? 1 : 0}
    //         verticals={this.state.facts['Verticals']}/>
    //       <EntityInfo className='entityDesc' content={this.state.facts["Short Description"]}/>
    //       <HSButton
    //         className='hsButton'
    //         href={`https://www.hockeystick.co/entities/${this.state.facts['id']}`}
    //         visible={this.state.loading || this.state.error ? 0 : 1}/>
    //     </Space>
    //     <img
    //       className={this.state.error ? 'hidden' : 'powered'}
    //       src={this.props.wpObject.images + '/Powered_By_HS.png'}
    //       style={{'marginTop': '20px'}}/>
    //   </Card>
    // );

    return (
      <div id='with-antd-styles' className='trigger' ref={this.ref}>
        <Popover
          overlayClassName='no-padding'
          content={
            <WidgetCard
              {...this.state}
              {...this.props}
            />
          }
          placement='bottom'
          trigger='click'
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
          getPopupContainer={() => {return this.ref.current}}
        >
          <Text underline>{this.props.wpObject.content}</Text>
        </Popover>
      </div>
    );


    // return (
    //   <>
    //     <Text
    //       className='trigger'
    //       onClick={this.handleClick}
    //       className='with-antd-styles'
    //       >{this.props.content}
    //       <Card className={this.state.visible ? 'card' : 'hidden'} onClick={(e) => {e.stopPropagation()}}>
    //         <WidgetSkeleton loading={this.state.loading && !(this.state.error)}/>
    //         {error}
    //         <Space className={(this.state.loading || this.state.error) ? 'hidden' : ''} direction='vertical' align='center' size={0}>
    //           <Logo
    //             src={'http://logo.hockeystick.co/' + domain + '?size=' + 106}
    //             placeholder={this.props.wpObject.images + '/Placeholder_Logo.png'}/>
    //           {entityName}
    //           {entityType}
    //           {entityLocation}
    //           {entityVerticals}
    //           {entityDesc}
    //           {hsButton}
    //         </Space>
    //         {powered}
    //       </Card>
    //     </Text>
    //     <div className={this.state.visible ? 'background' : 'hidden'}></div>
    //   </>
    // );
  }

  async fetchCompanyInfo(domain) {
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
                    }
                    option {
                      name
                    }
                  }
                  offices {
                    id
                    facts {
                      concept {
                        name
                      }
                      value
                      option {
                        name
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
    let response = await this.fetchData(query, 'https://graph.rc.hkst.io/', {domain});
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
        "concept": {"name": name},
        "option": option,
        "value": value
      } = fact;
      if (name == "Vertical") {
        facts["Verticals"].push((option && option.name) || value);
      } else {
        facts[name] = value;
      }
    });

    let headquarters = this.getHeadquarters(officeArray);

    // Ignore non-headquarter offices
    const officeFacts = (headquarters && headquarters["facts"]) || [];
    officeFacts.forEach(officeFact => {
      const {"concept": {"name": name}, "value": value} = officeFact;
      facts[name] = value;
    });
    return facts;
  }

  fetchData(query, url, variables) {
    let response = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
      referrerPolicy: 'origin'
    })
      .then(r => r.json());
    return response;
  }


  // Takes an array of structures representing offices, and returns one with
  // "OfficeType::Headquarter" as its value for "Office Type", if one exists.
  getHeadquarters(offices) {
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
            fact.concept.name &&
            fact.value &&
            fact.concept.name == 'Office Type' &&
            fact.value == 'OfficeType::Headquarter';
          }
        );
      }
    ) || null;
  }
}

export default (HockeystickWidget);
