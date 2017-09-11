module Main exposing (main)

import Array
import Brainloller.Lang exposing (BLOptCode, BLProgram, blCmd, blCmdPixel, getBlCmd)
import Brainloller.Pixel exposing (commandsForm, programForm, updateProgram)
import Brainloller.Program exposing (progHelloWorld)
import Collage exposing (collage)
import Debug
import Element exposing (Element, image, toHtml)
import Html exposing (Attribute, Html, button, div, h1, node, p, text)
import Html.Attributes exposing (class, href, rel)
import Html.Events exposing (onClick)
import List
import Maybe
import MouseEvents exposing (MouseEvent)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac


type Msg
    = SetCmd BLOptCode
    | WriteCmd MouseEvent


type alias Model =
    { program : BLProgram
    , activeCmd : Maybe BLOptCode
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
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( WriteCmd ev, { program }, Just activeCmd ) ->
            let
                x =
                    0

                y =
                    0

                pixel =
                    getBlCmd activeCmd blCmdPixel

                updated =
                    updateProgram program x y pixel
            in
            ( { model | program = updated }, Cmd.none )

        ( WriteCmd _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )


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

        startBtn =
            btn []
                [ text "Start" ]
    in
    div [ classes containerClasses ]
        [ stylesheet "/build/tachyons.min.css"
        , stylesheet "/assets/styles/editor.css"
        , title
        , startBtn
        , programCommands model
        , programOutput model
        ]


programOutput : Model -> Html Msg
programOutput model =
    div
        [ class "program-output"
        , MouseEvents.onClick WriteCmd
        ]
        [ toHtml <| collage 600 400 <| programForm model.program ]


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


btn : List (Attribute msg) -> List (Html msg) -> Html msg
btn attrs =
    let
        classList =
            [ "monospace"
            , Tac.f6
            , Tac.link
            , Tac.dim
            , Tac.ba
            , Tac.ph3
            , Tac.pv2
            , Tac.dib
            , Tac.black
            , Tac.ttu
            , Tac.bg_white
            , Tac.courier
            ]
    in
    button (classes classList :: attrs)


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
