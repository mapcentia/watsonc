import styled from "styled-components";
import Grid from "@material-ui/core/Grid";
import Title from "./shared/title/Title";
import Icon from "./shared/icons/Icon";
import CloseButton from "./shared/button/CloseButton";
import { hexToRgbA } from "../helpers/colors";
import { DarkTheme } from "../themes/DarkTheme";
import { Align } from "./shared/constants/align";
import { Variants } from "./shared/constants/variants";
import { Size } from "./shared/constants/size";
import ThemeProvider from "../themes/ThemeProvider";
import reduxStore from "../redux/store";
import { Provider } from "react-redux";
import { setDashboardMode } from "../redux/actions";
const session = require("./../../../session/browser/index");

function SubscriptionDialogue(props) {
  return (
    <ThemeProvider>
      <Provider store={reduxStore}>
        <Root>
          <ModalHeader>
            <Grid container>
              <Grid container item xs={10}>
                <Title
                  text={__("Få mere ud af Calypso")}
                  color={DarkTheme.colors.headings}
                />
              </Grid>
              <Grid container justify="flex-end" item xs={2}>
                <CloseButton onClick={props.onCloseButtonClick} />
              </Grid>
            </Grid>
          </ModalHeader>
          <ModalBody>
            <Grid container spacing={8}>
              <Grid container item xs={6}>
                <PlanPlaceholder> </PlanPlaceholder>
                <PlanItem>
                  <LabelContainer>
                    <Title
                      level={5}
                      text={__("Ubegrænset adgang til data")}
                      color={DarkTheme.colors.headings}
                    />
                  </LabelContainer>
                  <Title
                    level={7}
                    text={__(
                      "Data fra Jupiter, pesticider og online stationer samlet ét sted"
                    )}
                    color={DarkTheme.colors.gray[3]}
                  />
                </PlanItem>
                {/* <PlanItem>
                            <LabelContainer>
                                <Title level={5} text={__('Antal brugere')} color={DarkTheme.colors.headings} />
                            </LabelContainer>
                                <Title level={7} text={__('Arbejd sammen med dine kollegaer direkte i Calypso')} color={DarkTheme.colors.gray[3]} />
                        </PlanItem> */}
                <PlanItem>
                  <LabelContainer>
                    <Title
                      level={5}
                      text={__("Dashboard med grafvisning af data over tid")}
                      color={DarkTheme.colors.headings}
                    />
                  </LabelContainer>
                  <Title
                    level={7}
                    text={__(
                      "Gør det nemt at sammenligne data på tværs af boringer"
                    )}
                    color={DarkTheme.colors.gray[3]}
                  />
                </PlanItem>
                <PlanItem>
                  <LabelContainer>
                    <Title
                      level={5}
                      text={__("Profilværktøj med geologi og kemi")}
                      color={DarkTheme.colors.headings}
                    />
                  </LabelContainer>
                  <Title
                    level={7}
                    text={__(
                      "Grafisk visning af geologiske snit med jordlag og boringer"
                    )}
                    color={DarkTheme.colors.gray[3]}
                  />
                </PlanItem>
                {/* <PlanItem>
                            <LabelContainer>
                                <Title level={5} text={__('Boring- og kildeplads overvågning')} color={DarkTheme.colors.headings} />
                            </LabelContainer>
                                <Title level={7} text={__('Udvælg og hold automatisk øje med dine boringer og kildepladser')} color={DarkTheme.colors.gray[3]} />
                        </PlanItem> */}
              </Grid>
              <Grid container item xs={2}>
                <Plan className="short-title">
                  <PlanItemTitle className="short-title">
                    <LabelContainer>
                      <Title
                        level={3}
                        text={__("BASIS")}
                        color={DarkTheme.colors.headings}
                      />
                    </LabelContainer>
                    <LabelContainer>
                      <Title
                        level={7}
                        text={__(
                          "Prøv og bliv fortrolig med Calypso - ganske gratis"
                        )}
                        color={DarkTheme.colors.gray[3]}
                        align={Align.Center}
                      />
                    </LabelContainer>
                  </PlanItemTitle>
                  <PlanItem>
                    <IconContainer>
                      <Icon name="check-mark-solid" size={12} />
                    </IconContainer>
                  </PlanItem>
                  {/* <PlanItem>
                                <PlanFeature>
                                    <Title level={6} text={__('1 bruger')} color={DarkTheme.colors.gray[3]} />
                                </PlanFeature>
                            </PlanItem> */}
                  <PlanItem>
                    <PlanFeature>
                      <Title
                        level={6}
                        text={__("1 gemt graf")}
                        color={DarkTheme.colors.gray[3]}
                      />
                    </PlanFeature>
                  </PlanItem>
                  <PlanItem>
                    <PlanFeature>
                      <Title
                        level={6}
                        text={__("1 gemt profil")}
                        color={DarkTheme.colors.gray[3]}
                      />
                    </PlanFeature>
                  </PlanItem>
                  {/* <PlanItem>
                                <PlanFeature>
                                </PlanFeature>
                            </PlanItem> */}
                </Plan>
              </Grid>
              <Grid container item xs={2}>
                <Plan className="short-title">
                  <PlanItemTitle className="short-title">
                    <LabelContainer>
                      <Title
                        level={3}
                        text={__("Premium")}
                        color={DarkTheme.colors.headings}
                      />
                    </LabelContainer>
                    <LabelContainer>
                      <Title
                        level={7}
                        text={__("200 kr. pr. måned")}
                        color={DarkTheme.colors.gray[3]}
                        align={Align.Center}
                      />
                    </LabelContainer>
                  </PlanItemTitle>
                  <PlanItem>
                    <IconContainer>
                      <Icon name="check-mark-solid" size={12} />
                    </IconContainer>
                  </PlanItem>
                  {/* <PlanItem>
                                <PlanFeature>
                                    <Title level={6} text={__('1 bruger')} color={DarkTheme.colors.gray[3]} />
                                </PlanFeature>
                            </PlanItem> */}
                  <PlanItem>
                    <PlanFeature>
                      <Title
                        level={6}
                        text={__("Ubegrænset")}
                        color={DarkTheme.colors.gray[3]}
                      />
                    </PlanFeature>
                  </PlanItem>
                  <PlanItem>
                    <PlanFeature>
                      <Title
                        level={6}
                        text={__("Ubegrænset")}
                        color={DarkTheme.colors.gray[3]}
                      />
                    </PlanFeature>
                  </PlanItem>
                  {/* <PlanItem>
                                <PlanFeature>
                                    <Title level={6} text={__('5 boringer')} color={DarkTheme.colors.gray[3]} />
                                </PlanFeature>
                            </PlanItem> */}
                </Plan>
              </Grid>
              <Grid container item xs={2}>
                <Plan>
                  <PlanItemTitle>
                    <Title
                      level={5}
                      text={__("Calypso for")}
                      color={DarkTheme.colors.gray[3]}
                    />
                    <LabelContainer>
                      <Title
                        level={3}
                        text={__("Virksomheder")}
                        color={DarkTheme.colors.headings}
                      />
                    </LabelContainer>
                    <LabelContainer>
                      <Title
                        level={7}
                        text={__("Tag kontakt")}
                        color={DarkTheme.colors.gray[3]}
                        align={Align.Center}
                      />
                    </LabelContainer>
                  </PlanItemTitle>
                  <PlanItem>
                    <IconContainer>
                      <Icon name="check-mark-solid" size={12} />
                    </IconContainer>
                  </PlanItem>
                  {/* <PlanItem>
                                <PlanFeature>
                                    <Title level={6} text={__('5 brugere')} color={DarkTheme.colors.gray[3]} />
                                </PlanFeature>
                            </PlanItem> */}
                  <PlanItem>
                    <PlanFeature>
                      <Title
                        level={6}
                        text={__("Ubegrænset")}
                        color={DarkTheme.colors.gray[3]}
                      />
                    </PlanFeature>
                  </PlanItem>
                  <PlanItem>
                    <PlanFeature>
                      <Title
                        level={6}
                        text={__("Ubegrænset")}
                        color={DarkTheme.colors.gray[3]}
                      />
                    </PlanFeature>
                  </PlanItem>
                  {/* <PlanItem>
                                <PlanFeature>
                                    <Title level={6} text={__('Ubegrænset')} color={DarkTheme.colors.gray[3]} />
                                </PlanFeature>
                            </PlanItem> */}
                </Plan>
              </Grid>
            </Grid>
            <Grid container>
              <Grid container item xs={6}></Grid>
              <Grid container item xs={2}></Grid>
              <Grid container item xs={2}>
                <SelectPlanButton
                  onClick={() =>
                    window.open(
                      "https://admin.calypso.watsonc.dk/login?new=1",
                      "_blank"
                    )
                  }
                >
                  {__("Vælg premium")}{" "}
                </SelectPlanButton>
              </Grid>
              <Grid container item xs={2}>
                <SelectPlanButton
                  onClick={() =>
                    window.open("https://watsonc.dk/kontakt-os/", "_blank")
                  }
                >
                  {__("Kontakt")}{" "}
                </SelectPlanButton>
              </Grid>
            </Grid>
          </ModalBody>
        </Root>
      </Provider>
    </ThemeProvider>
  );
}

const Root = styled.div`
  background: ${({ theme }) => hexToRgbA(theme.colors.primary[1], 0.96)};
  border-radius: ${({ theme }) => `${theme.layout.borderRadius.large}px`};
  color: ${({ theme }) => `${theme.colors.headings}`};
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) =>
    `${theme.layout.gutter}px ${theme.layout.gutter}px 0 ${theme.layout.gutter}px`};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => `${theme.layout.gutter}px`};
`;

const LabelContainer = styled.div`
  display: block;
`;

const Plan = styled.div`
  width: 100%;
  border: 3px solid ${({ theme }) => `${theme.colors.primary[3]}`};
  border-radius: ${({ theme }) => `12px 12px 0px 0px`};
  &.short-title {
    margin-top: 16px;
  }
  &:hover {
    border: 3px solid ${({ theme }) => `${theme.colors.interaction[4]}`};
  }
`;

const PlanPlaceholder = styled.div`
  height: 80px;
  width: 100%;
`;

const PlanItemTitle = styled.div`
  width: 100%;
  height: 80px;
  text-align: center;
  background: ${({ theme }) => `${theme.colors.primary[3]}`};
  padding: ${({ theme }) => `${theme.layout.gutter / 4}px`};
  border-radius: ${({ theme }) =>
    `${theme.layout.gutter / 4}px ${theme.layout.gutter / 4}px 0px 0px`};
  &.short-title {
    height: 64px;
  }
`;

const PlanFeature = styled.div``;

const PlanItem = styled.div`
  height: 80px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.gray[2]}`};
  padding-bottom: ${({ theme }) => `${theme.layout.gutter / 4}px`};
  ${PlanFeature} {
    margin: auto;
  }
  &:last-child {
    border-bottom: 0;
  }
`;

const IconContainer = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: ${({ theme }) => `${theme.colors.interaction[4]}`};
  color: #000;
  margin: auto;
  text-align: center;
`;

const SelectPlanButton = styled.button`
  background: ${({ theme }) => `${theme.colors.interaction[4]}`};
  color: #000;
  border: none;
  border-radius: ${({ theme }) => `${theme.layout.borderRadius.small}px`};
  text-align: center;
  width: 100%;
  height: 50px;
  margin: auto;
  margin-top: ${({ theme }) => `${theme.layout.gutter / 2}px`};
  margin-left: 6px;
`;

export default SubscriptionDialogue;
