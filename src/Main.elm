module Main exposing (main)

import Brainloller.Lang exposing (BLOptCode, BLProgram, blCmdPixel, getBlCmd)
import Brainloller.Pixel exposing (commandsForm, getCellMaybe, programCells, programDimensions, resizeProgram, setCellAt)
import Brainloller.Program exposing (progHelloWorld)
import Elem exposing (cmdBtn, mainTitle, stylesheet, textCopy)
import Html exposing (Html, div)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)
import List
import Maybe
import Tachyons exposing (classes)
import Tachyons.Classes as Tac


type Msg
    = SetCmd BLOptCode
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | ZoomIn
    | ZoomOut


type alias Model =
    { program : BLProgram
    , activeCmd : Maybe BLOptCode
    , sizeIncrease : Int
    , zoomLevel : Float
    , writeEnabled : Bool
    }


main =
    Html.program
        { init = ( initialModel, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


initialModel : Model
initialModel =
    { program = progHelloWorld
    , activeCmd = Nothing
    , sizeIncrease = 5
    , zoomLevel = 1
    , writeEnabled = False
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( WriteCmd x y force, { writeEnabled, program }, Just activeCmd ) ->
            let
                pixel =
                    getBlCmd activeCmd blCmdPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        resizeProgram program x y
                    else
                        program

                updated =
                    case ( rewrite, getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            setCellAt resized x y pixel

                        _ ->
                            program
            in
            ( { model | program = updated }, Cmd.none )

        ( WriteCmd _ _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( EnableWrite, _, _ ) ->
            ( { model | writeEnabled = True }, Cmd.none )

        ( DisableWrite, _, _ ) ->
            ( { model | writeEnabled = False }, Cmd.none )

        ( IncreaseSize, { sizeIncrease }, _ ) ->
            ( { model | sizeIncrease = sizeIncrease + 1 }, Cmd.none )

        ( DecreaseSize, { sizeIncrease }, _ ) ->
            ( { model | sizeIncrease = sizeIncrease - 1 }, Cmd.none )

        ( ZoomIn, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel + 0.1 }, Cmd.none )

        ( ZoomOut, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel - 0.1 }, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"

        containerClasses =
            [ "main-container"
            , Tac.cf
            , Tac.pa3
            , Tac.pa4_ns
            ]
    in
    div [ classes containerClasses ]
        [ stylesheet "/build/tachyons.min.css"
        , stylesheet "/assets/styles/editor.css"
        , title
        , programContainer model
        ]


programContainer : Model -> Html Msg
programContainer model =
    let
        growBtn =
            cmdBtn "assets/images/increase.svg" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdBtn "assets/images/decrease.svg" [ onClick DecreaseSize ]

        zoomInBtn =
            cmdBtn "assets/images/zoom-in.svg" [ onClick ZoomIn ]

        zoomOutBtn =
            cmdBtn "assets/images/zoom-out.svg" [ onClick ZoomOut ]
    in
    div []
        [ div
            []
          <|
            growBtn
                :: shrinkBtn
                :: zoomInBtn
                :: zoomOutBtn
                :: programCommands model
        , div
            []
            [ programOutput model ]
        ]


programOutput : Model -> Html Msg
programOutput model =
    let
        program =
            model.program

        dim =
            programDimensions program

        width =
            Tuple.first dim + model.sizeIncrease

        height =
            Tuple.second dim + model.sizeIncrease

        write =
            \x y f -> WriteCmd x y f
    in
    div
        [ class "program-cells" ]
        [ div
            [ style [ ( "zoom", toString model.zoomLevel ) ] ]
            [ programCells width height model.program write EnableWrite DisableWrite ]
        ]


programCommands : Model -> List (Html Msg)
programCommands model =
    let
        setCmd =
            \cmd -> SetCmd cmd

        activeCmd =
            Maybe.withDefault "" model.activeCmd
    in
    commandsForm setCmd activeCmd
