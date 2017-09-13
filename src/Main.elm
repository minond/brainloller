module Main exposing (main)

import Array
import Brainloller.Lang exposing (BLOptCode, BLProgram, blCmd, blCmdPixel, getBlCmd)
import Brainloller.Pixel exposing (commandsForm, programCells, programDimensions, programForm, setCellAt)
import Brainloller.Program exposing (progHelloWorld)
import Debug
import Element exposing (Element, image)
import Html exposing (Attribute, Html, button, div, h1, img, node, p, table, td, text, tr)
import Html.Attributes exposing (class, href, rel, src)
import Html.Events exposing (onClick)
import List
import Maybe
import Tachyons exposing (classes)
import Tachyons.Classes as Tac


type Msg
    = SetCmd BLOptCode
    | WriteCmd Int Int
    | IncreaseSize
    | DecreaseSize


type alias Model =
    { program : BLProgram
    , activeCmd : Maybe BLOptCode
    , sizeIncrease : Int
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
    , sizeIncrease = 10
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( WriteCmd x y, { program }, Just activeCmd ) ->
            let
                pixel =
                    getBlCmd activeCmd blCmdPixel

                updated =
                    setCellAt program x y pixel
            in
            ( { model | program = updated }, Cmd.none )

        ( WriteCmd _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( IncreaseSize, { sizeIncrease }, _ ) ->
            ( { model | sizeIncrease = sizeIncrease + 1 }, Cmd.none )

        ( DecreaseSize, { sizeIncrease }, _ ) ->
            ( { model | sizeIncrease = sizeIncrease - 1 }, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"

        containerClasses =
            [ "program-container"
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
            cmdBtn "/assets/images/increase.svg" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdBtn "/assets/images/decrease.svg" [ onClick DecreaseSize ]
    in
    div []
        [ table
            [ class "program-container-table" ]
            [ tr
                []
                [ td
                    [ class "program-buttons" ]
                    [ growBtn
                    , shrinkBtn
                    ]
                , td
                    [ class Tac.pl5 ]
                    [ programOutput model ]
                ]
            ]
        , programCommands model
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

        click =
            \x y -> WriteCmd x y
    in
    div
        [ class "program-output" ]
        [ programCells width height model.program click ]


programCommands : Model -> Html Msg
programCommands model =
    let
        setCmd =
            \cmd -> SetCmd cmd

        activeCmd =
            Maybe.withDefault "" model.activeCmd
    in
    div [ class "program-commands" ]
        [ commandsForm setCmd activeCmd ]


cmdBtn : String -> List (Attribute msg) -> Html msg
cmdBtn imgSrc attrs =
    button (class "cmd-button" :: attrs)
        [ img
            [ src imgSrc ]
            []
        ]


stylesheet : String -> Html msg
stylesheet url =
    node "link"
        [ rel "stylesheet"
        , href url
        ]
        []


mainTitle : String -> Html msg
mainTitle title =
    let
        h1Classes =
            [ Tac.mt0
            , Tac.f3
            , Tac.f2_m
            , Tac.f1_l
            , Tac.fw1
            , Tac.baskerville
            ]
    in
    h1 [ classes h1Classes ]
        [ text title ]


textCopy : String -> Html msg
textCopy copy =
    let
        pClasses =
            [ Tac.lh_copy
            , Tac.helvetica
            ]
    in
    p [ classes pClasses ]
        [ text copy ]
