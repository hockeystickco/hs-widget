import React from 'react';
import { Card, Skeleton, Tag, Button, Typography, Space } from 'antd';
import onClickOutside from "react-onclickoutside";

const { Text } = Typography;

import './styles/hockeystick-widget.less';
import './styles/hockeystick-widget.css'

import en from './data/en.json';
import WidgetSkeleton from './WidgetSkeleton.jsx';
import Logo from './Logo.jsx';

class HockeystickWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visible: false,
      error: false,
      facts: {"Verticals": []},
    };
  }

  handleClick = (e) => {
    this.setState({
      'visible': !this.state.visible
    });
    if (this.state.loading) {
      this.fetchCompanyInfo(this.props.domain)
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
  }

  handleClickOutside = evt => {
    this.setState({
      visible: false
    });
  };

  render() {
    const noVerticals = ["Government", "Investor", "Accelerator / Incubator"];

    const entityName = (this.state.facts["Operating Name"] || this.state.facts["Legal Name"]) ?
    (<Text
      className="entityName">
      {this.state.facts["Operating Name"] || this.state.facts["Legal Name"]}
    </Text>) : null;

    const entityType = (this.state.facts["Organization Type"]) ?
    (<Text
      className="entityType">
      {this.normalizeType(this.state.facts["Organization Type"])}
    </Text>) : null;

    const entityLocation = (this.state.facts["Location"]) ?
    (<Text
      className="entityLocation">
      {this.normalizeLocation(this.state.facts["Location"])}
    </Text>) : null;

    const entityVerticals = (this.state.facts["Verticals"].length > 0 && !(noVerticals.includes(this.normalizeType(this.state.facts["Organization Type"])))) ?
    (<Space
      className="verticalList"
      size={3}>
      {this.state.facts["Verticals"].slice(0, 3).map(vertical => <Tag key={vertical} className="vertical">{vertical}</Tag>)}
      {this.state.facts["Verticals"].slice(3, 6).map(vertical => <Tag key={vertical} className="vertical">{vertical}</Tag>)}
      {/*"TravelTech", "Vertical2"].map(vertical => <Tag className="vertical">{vertical}</Tag>)*/}
    </Space>) : null;

    const entityDesc = (this.state.facts["Short Description"]) ?
    (<Text
      className="entityDesc">
      {this.state.facts["Short Description"]}
    </Text>) : null;

    const hsButton = <Button
      type="primary"
      className="hsButton"
      href={"https://www.hockeystick.co/entities/" + this.state.facts["id"]}
      target="_blank">View Hockeystick Profile</Button>;

    const powered = this.state.error ? null : <img
      className='powered'
      src={'https://i.imgur.com/YUKlZj0.png'}
      style={{marginTop: '20px'}}/>;

    const error = this.state.error ? (
      <Space direction='vertical' align='center' style={{'marginTop': '150px', 'marginBottom': '150px'}}>
        <img
          className='error'
          src={'https://i.imgur.com/RE4NgFq.png'}/>
        <Text className='entityDesc' style={{'margin': '0'}}>{'Whoops. Something went wrong'}</Text>
        <Text className='entityLocation'>{'Please try again later'}</Text>
      </Space>) : null;

    const {domain, ...props} = this.props;

    return (
      <>
        <Text
          className='trigger'
          onClick={this.handleClick}
          id='antd'
          >{this.props.content}
          <Card className={this.state.visible ? 'card' : 'hidden'} onClick={(e) => {e.stopPropagation()}}>
            <WidgetSkeleton loading={this.state.loading && !(this.state.error)}/>
            {error}
            <Space className={(this.state.loading || this.state.error) ? 'hidden' : ''} direction='vertical' align='center' size={0}>
              <Logo src={'http://logo.hockeystick.co/' + domain + '?size=' + 106}/>
              {entityName}
              {entityType}
              {entityLocation}
              {entityVerticals}
              {entityDesc}
              {hsButton}
            </Space>
            {powered}
          </Card>
        </Text>
        <div className={this.state.visible ? 'background' : 'hidden'}></div>
      </>
    );
  }

  async fetchCompanyInfo(domain) {
    let facts = {"Verticals": []};
    const query = `
      query SearchQuery {
        view(datasets: ["public"]) {
          search(type: ENTITY, page: 1, pageSize: 10, sortOrder: null, first: 1, conceptFilters: [{string: {like: "` + domain + `"}, uniqueKey: "Entity::Domain"}]) {
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
    let response = await this.fetchData(query, 'https://graph.rc.hkst.io/');
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

  fetchData(query, url) {
    let response = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({query}),
      referrerPolicy: "origin"
    })
      .then(r => r.json());
    return response;
  }


  // Takes an array of structures representing offices, and returns one with
  // "OfficeType::Headquarter" as its value for "Office Type", if one exists.
  getHeadquarters(offices) {
    let headquarters = null;
    offices.forEach(office => {
      const {"facts": officeFacts} = office;
      officeFacts.forEach(officeFact => {
        const {"concept": {"name": name}, "value": value} = officeFact;
        if (name == "Office Type" && value == "OfficeType::Headquarter") {
          headquarters = office;
        }
      });
    });
    return headquarters;
  }

  normalizeLocation(uniqueKey) {
    const tokens = uniqueKey.split('::');
    let location = en[uniqueKey];
    while (tokens.length > 2) {
      tokens.pop();
      location += ", " + en[tokens.join('::')];
    }
    return location;
  }

  normalizeType(uniqueKey) {
    const tokens = uniqueKey.split('::');
    while (tokens.length > 2) {
      tokens.pop();
    }
    return en[tokens.join('::')];
  }
}

export default onClickOutside(HockeystickWidget);
