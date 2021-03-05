import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

export default class CreateRoomPage extends Component {
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {},
    };

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            successMessage: "",
            errorMessage: "",
        };
    }

    handleVotesChange = (e) => {
        this.setState({
            votesToSkip: e.target.value,
        });
    };

    handleGuestCanPauseChange = (e) => {
        this.setState({
            guestCanPause: e.target.value === "true" ? true : false,
        });
    };

    handleRoomButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
            }),
        };

        fetch("/api/create-room", requestOptions)
            .then((response) => {
                return response.json();
            })
            .then((data) => this.props.history.push("/room/" + data.code));
    };

    handleUpdateButtonPress = () => {
        const requestOptions = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode,
            }),
        };

        fetch("/api/update-room", requestOptions).then((response) => {
            if (response.ok) {
                this.setState({
                    successMessage: "Room updated successfully!",
                });
            } else {
                this.setState({
                    errorMessage: "Error updating room.",
                });
            }
            this.props.updateCallback();
        });
    };

    renderCreateButtons = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.handleRoomButtonPressed}
                    >
                        Create A Room
                    </Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button
                        color="secondary"
                        variant="contained"
                        to="/"
                        component={Link}
                    >
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    };

    renderUpdatebuttons = () => {
        return (
            <Grid item xs={12} align="center">
                <Button
                    color="primary"
                    variant="contained"
                    onClick={this.handleUpdateButtonPress}
                >
                    Update Room
                </Button>
            </Grid>
        );
    };

    render() {
        const title = this.props.update ? "Update Room" : "Create Room";

        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Collapse
                        in={
                            this.state.errorMessage != "" ||
                            this.state.successMessage != ""
                        }
                    >
                        {this.state.successMessage != "" ? (
                            <Alert
                                severity="success"
                                onClose={() => {
                                    this.setState({ successMessage: "" });
                                }}
                            >
                                {this.state.successMessage}
                            </Alert>
                        ) : (
                            <Alert
                                severity="error"
                                onClose={() => {
                                    this.setState({ errorMessage: "" });
                                }}
                            >
                                {this.state.errorMessage}
                            </Alert>
                        )}
                    </Collapse>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        {title}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText>
                            <div align="center">
                                Guest Control of Playback State
                            </div>
                        </FormHelperText>
                        <RadioGroup
                            row
                            defaultValue={this.props.guestCanPause.toString()}
                            onChange={this.handleGuestCanPauseChange}
                        >
                            <FormControlLabel
                                value="true"
                                control={<Radio color="primary" />}
                                label="Play/Pause"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel
                                value="false"
                                control={<Radio color="secondary" />}
                                label="No Control"
                                labelPlacement="bottom"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField
                            required="true"
                            type="number"
                            defaultValue={this.state.votesToSkip}
                            inputProps={{
                                min: 1,
                                style: { textAlign: "center" },
                            }}
                            onChange={this.handleVotesChange}
                        />
                        <FormHelperText>
                            <div aling="center">Votes Requred To Skip Song</div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                {this.props.update
                    ? this.renderUpdatebuttons()
                    : this.renderCreateButtons()}
            </Grid>
        );
    }
}
