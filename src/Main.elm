module Main exposing (main)

import Editor
    exposing
        ( cmdContentBtn
        , cmdTextBtn
        , commandsForm
        , link
        , mainTitle
        , memoryTape
        , programCells
        , textCopy
        , textLabel
        )
import Html exposing (Html, div, input, label, option, select, span, text)
import Html.Attributes exposing (class, id, style, type_, value)
import Html.Events exposing (on, onClick, onInput)
import Json.Decode as Json
import Lang
    exposing
        ( BLOptCode
        , BLProgram
        , BLRuntime
        , blCmdPixel
        , createRuntime
        , getBlCmd
        , getCellMaybe
        , programDimensions
        , resizeProgram
        , setCellAt
        )
import List
import Maybe
import Ports
    exposing
        ( downloadProgram
        , imageProcessed
        , interpreterHalt
        , interpreterTick
        , pauseExecution
        , setInterpreterSpeed
        , startExecution
        , uploadProgram
        )
import Program exposing (progCat, progFib, progHelloWorld)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Tuple exposing (first, second)
import Util exposing (asList)


type Msg
    = NoOp
    | SetCmd BLOptCode
    | SetSpeed String
    | LoadMemoryProgram String
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | DownloadProgram
    | UploadProgram
    | ImageProcessed BLProgram
    | Undo
    | Redo
    | ZoomIn
    | ZoomOut
    | Reset
    | Start
    | Pause
    | Continue
    | Tick BLRuntime
    | Halt BLRuntime


type History a
    = Curr a
    | BackCurr (List a) a
    | BackCurrForw (List a) a (List a)


type alias Model =
    { work : History BLProgram
    , activeCmd : Maybe BLOptCode
    , runtime : BLRuntime
    , tickCounter : Int
    , boardDimensions : ( Int, Int )
    , zoomLevel : Float
    , interpreterSpeed : String
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
    { work = Curr progHelloWorld
    , activeCmd = Nothing
    , runtime = createRuntime Nothing
    , tickCounter = 0
    , boardDimensions = programDimensions progHelloWorld
    , zoomLevel = 1
    , interpreterSpeed = "5"
    , writeEnabled = False
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( NoOp, _, _ ) ->
            ( model, Cmd.none )

        ( LoadMemoryProgram prog, { work }, _ ) ->
            let
                runtime =
                    createRuntime Nothing

                program =
                    case prog of
                        "helloworld.png" ->
                            progHelloWorld

                        "cat.png" ->
                            progCat

                        "fib.png" ->
                            progFib

                        _ ->
                            []
            in
            ( { model
                | runtime = runtime
                , work = Curr program
              }
            , pauseExecution
                { program = program
                , runtime = runtime
                }
            )

        ( SetSpeed speed, _, _ ) ->
            ( { model | interpreterSpeed = speed }, setInterpreterSpeed speed )

        ( Pause, { work, runtime }, _ ) ->
            ( model
            , pauseExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Continue, { work, runtime }, _ ) ->
            ( model
            , startExecution
                { program = historyCurr work
                , runtime = runtime
                }
            )

        ( Start, { work, runtime }, _ ) ->
            ( { model | tickCounter = 0 }
            , startExecution
                { program = historyCurr work
                , runtime =
                    { runtime
                        | activeCoor = ( 0, 0 )
                        , activeCell = 0
                        , pointerDeg = 0
                        , input = Nothing
                        , output = Nothing
                        , memory = []
                    }
                }
            )

        ( Tick runtime, { tickCounter }, _ ) ->
            ( { model
                | runtime = runtime
                , tickCounter = tickCounter + 1
              }
            , Cmd.none
            )

        ( Halt runtime, _, _ ) ->
            ( model, Cmd.none )

        ( UploadProgram, _, _ ) ->
            ( model, uploadProgram "#fileupload" )

        ( DownloadProgram, { work }, _ ) ->
            ( model, downloadProgram (historyCurr work) )

        ( ImageProcessed prog, _, _ ) ->
            ( { model
                | work = Curr prog
                , zoomLevel = 1
                , boardDimensions = programDimensions prog
              }
            , Cmd.none
            )

        ( Undo, { work }, _ ) ->
            case work of
                Curr _ ->
                    ( model, Cmd.none )

                BackCurr back curr ->
                    let
                        newCurr =
                            asList <| List.head back

                        newBack =
                            asList <| List.tail back

                        newForw =
                            [ curr ]

                        update =
                            BackCurrForw newBack newCurr newForw
                    in
                    ( { model | work = update }, Cmd.none )

                BackCurrForw back curr forw ->
                    let
                        newForw =
                            curr :: forw

                        update =
                            case back of
                                [] ->
                                    BackCurrForw [] curr forw

                                [ head ] ->
                                    BackCurrForw [] head newForw

                                head :: tail ->
                                    BackCurrForw tail head newForw
                    in
                    ( { model | work = update }, Cmd.none )

        ( Redo, { work }, _ ) ->
            case work of
                BackCurrForw back curr forw ->
                    let
                        newBack =
                            curr :: back

                        update =
                            case forw of
                                [] ->
                                    BackCurr back curr

                                [ head ] ->
                                    BackCurr newBack head

                                head :: tail ->
                                    BackCurrForw newBack head tail
                    in
                    ( { model | work = update }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ( WriteCmd x y force, { writeEnabled, work }, Just activeCmd ) ->
            let
                program =
                    historyCurr work

                back =
                    List.take 20 (program :: historyBack work)

                pixel =
                    getBlCmd activeCmd blCmdPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        resizeProgram program x y
                    else
                        program

                update =
                    case ( rewrite, getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            BackCurr back (setCellAt resized x y pixel)

                        _ ->
                            work
            in
            ( { model | work = update }, Cmd.none )

        ( WriteCmd _ _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( EnableWrite, _, _ ) ->
            ( { model | writeEnabled = True }, Cmd.none )

        ( DisableWrite, _, _ ) ->
            ( { model | writeEnabled = False }, Cmd.none )

        ( IncreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions + 1, second boardDimensions + 1 )
              }
            , Cmd.none
            )

        ( DecreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions - 1, second boardDimensions - 1 )
              }
            , Cmd.none
            )

        ( ZoomIn, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel + 0.1 }, Cmd.none )

        ( ZoomOut, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel - 0.1 }, Cmd.none )

        ( Reset, _, _ ) ->
            ( { model | work = Curr [] }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ imageProcessed ImageProcessed
        , interpreterTick Tick
        , interpreterHalt Halt
        ]


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"

        cmdClass =
            Maybe.withDefault "" model.activeCmd

        containerClasses =
            [ "main-container"
            , "main-container--" ++ cmdClass
            , Tac.cf
            , Tac.pa3
            , Tac.pa4_ns
            ]
    in
    div [ classes containerClasses ]
        [ title
        , div
            [ class "cf" ]
            [ div
                [ class "w-100 w-40-l mb4" ]
                [ textCopy introText1 ]
            , div
                [ class "" ]
                [ programContainer model ]
            ]
        ]


programContainer : Model -> Html Msg
programContainer model =
    let
        uploadBtn =
            cmdContentBtn
                "Upload"
                [ onClick NoOp ]
                [ input
                    [ type_ "file"
                    , id "fileupload"
                    , class "dn"
                    , on "change" (Json.succeed UploadProgram)
                    ]
                    []
                ]

        downloadBtn =
            cmdTextBtn "Download" [ onClick DownloadProgram ]

        playBtn =
            cmdTextBtn "Play" [ onClick Start ]

        continueBtn =
            cmdTextBtn "Continue" [ onClick Continue ]

        pauseBtn =
            cmdTextBtn "Pause" [ onClick Pause ]

        undoBtn =
            cmdTextBtn "Undo" [ onClick Undo ]

        redoBtn =
            cmdTextBtn "Redo" [ onClick Redo ]

        growBtn =
            cmdTextBtn "Expand canvas" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdTextBtn "Contract canvas" [ onClick DecreaseSize ]

        zoomInBtn =
            cmdTextBtn "Zoom in" [ onClick ZoomIn ]

        zoomOutBtn =
            cmdTextBtn "Zoom out" [ onClick ZoomOut ]

        resetBtn =
            cmdTextBtn "Clear" [ onClick Reset ]

        commands =
            [ playBtn
            , pauseBtn
            , continueBtn
            , undoBtn
            , redoBtn
            , growBtn
            , shrinkBtn
            , zoomInBtn
            , zoomOutBtn
            , resetBtn
            , uploadBtn
            , downloadBtn
            ]

        output =
            div
                [ class "program-output" ]
                [ text (Maybe.withDefault "none" model.runtime.output) ]
    in
    div
        [ class "cf" ]
        [ div
            [ class "fl w-100 w-50-m w-40-l pr3-m pr5-l" ]
            [ div
                []
                [ textLabel
                    "Load a program"
                    [ select
                        [ onInput LoadMemoryProgram ]
                        [ option
                            []
                            [ text "helloworld.png" ]
                        , option
                            []
                            [ text "cat.png" ]
                        , option
                            []
                            [ text "fib.png" ]
                        ]
                    ]
                ]
            , div
                []
                [ textLabel
                    "Change evaluation speed"
                    [ input
                        [ type_ "range"
                        , value model.interpreterSpeed
                        , onInput SetSpeed
                        ]
                        []
                    ]
                ]
            , div
                []
                [ textLabel
                    "Editor and program commands"
                    [ div
                        []
                        commands
                    ]
                ]
            , div
                []
                [ textLabel
                    "Brainloller commands"
                    [ div
                        []
                        (programCommands model)
                    ]
                ]
            , div
                []
                [ textLabel
                    "Program output"
                    [ output ]
                ]
            , div
                []
                [ textLabel
                    "Program memory"
                    [ div
                        [ class "program-memory" ]
                        (memoryTape model.runtime)
                    ]
                ]
            ]
        , div
            [ class "helvetica program-message-status" ]
            [ text "" ]
        , div
            [ class "noselect fl w-100 w-50-m w-60-l" ]
            [ programCanvas model ]
        ]


programCanvas : Model -> Html Msg
programCanvas model =
    let
        program =
            historyCurr model.work

        dim =
            programDimensions program

        minWidth =
            35

        minHeight =
            25

        width =
            2 + max minWidth (max (first dim) (first model.boardDimensions))

        height =
            2 + max minHeight (max (second dim) (second model.boardDimensions))

        write =
            \x y f -> WriteCmd x y f
    in
    div
        [ class "program-cells" ]
        [ div
            [ class "program-cells-wrapper" ]
            [ div
                [ style [ ( "zoom", toString model.zoomLevel ) ] ]
                [ programCells width height program model.runtime write EnableWrite DisableWrite ]
            ]
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


historyCurr : History a -> a
historyCurr hist =
    case hist of
        Curr val ->
            val

        BackCurr _ val ->
            val

        BackCurrForw _ val _ ->
            val


historyBack : History a -> List a
historyBack hist =
    case hist of
        Curr _ ->
            []

        BackCurr back _ ->
            back

        BackCurrForw back _ _ ->
            back


introText1 : List (Html msg)
introText1 =
    [ textCopy
        [ link "Brainloller" "https://esolangs.org/wiki/Brainloller" True
        , text " is "
        , link "Brainfuck" "https://esolangs.org/wiki/Brainfuck" False
        , text """ but represented as an image. If you're not familiar with
            Brainfuck already, go checkout
            """
        , link " this debugger" "http://minond.xyz/brainfuck" True
        , text """. Brainloller gives you the eight commands that you have in
            Brainfuck with two additional commands for rotating the direction
            in which the program is evaluated. Below is an editor and
            interpreter. Automatically loaded is a "Hello, World" program. Run
            it by clicking on the "Play" button below.
            """
        ]
    ]
